import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | null = null;

export function getIO(): SocketIOServer | null {
  return io;
}

export function initSocketServer(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    socket.on("driver:online", (data: { driverId: string; lat: number; lng: number; vehicleType: string }) => {
      socket.join("drivers:available");
      socket.data = {
        driverId: data.driverId,
        lat: data.lat,
        lng: data.lng,
        vehicleType: data.vehicleType,
      };
      console.log(`[Socket] Driver ${data.driverId} online`);
    });

    socket.on("driver:offline", () => {
      socket.leave("drivers:available");
    });

    socket.on("trip:broadcast", (data: { tripId: string; serviceType: string; pickupAddress: string }) => {
      io?.to("drivers:available").emit("trip:new", {
        tripId: data.tripId,
        serviceType: data.serviceType,
        pickupAddress: data.pickupAddress,
      });
      console.log(`[Socket] Trip ${data.tripId} broadcast to drivers`);
    });

    socket.on("bid:submit", (data: { tripId: string; bid: { id: string; driverId: string; price: number; driverName: string; rating: number; totalTrips: number } }) => {
      socket.join(`trip:${data.tripId}`);
      io?.to(`trip:${data.tripId}`).emit("bid:update", data.bid);
      console.log(`[Socket] Bid submitted for trip ${data.tripId}: ${data.bid.price} LYD`);
    });

    socket.on("trip:join", (tripId: string) => {
      socket.join(`trip:${tripId}`);
    });

    socket.on("trip:leave", (tripId: string) => {
      socket.leave(`trip:${tripId}`);
    });

    socket.on("bid:accepted", (data: { tripId: string; driverId: string }) => {
      io?.to("drivers:available").emit("bid:accepted_external", data);
      io?.to(`trip:${data.tripId}`).emit("bid:accepted", {
        tripId: data.tripId,
        driverId: data.driverId,
      });
    });

    socket.on("location:update", (data: { tripId: string; lat: number; lng: number }) => {
      io?.to(`trip:${data.tripId}`).emit("location:changed", {
        lat: data.lat,
        lng: data.lng,
      });
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);
      socket.leave("drivers:available");
    });
  });

  console.log("[Socket] Server initialized");
  return io;
}

export function broadcastNewTrip(tripId: string, serviceType: string, pickupAddress: string) {
  if (io) {
    io.to("drivers:available").emit("trip:new", { tripId, serviceType, pickupAddress });
  }
}

export function emitBidUpdate(tripId: string, bid: any) {
  if (io) {
    io.to(`trip:${tripId}`).emit("bid:update", bid);
  }
}
