import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";

const globalForSocket = globalThis as unknown as {
  io: SocketIOServer | undefined;
};

export function getIO(): SocketIOServer | null {
  return globalForSocket.io || null;
}

export function initSocketServer(httpServer: HTTPServer) {
  globalForSocket.io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    socket.on("driver:online", (data: { driverId: string; lat: number; lng: number; vehicleType: string; city: string }) => {
      const city = data.city || "بني وليد";
      socket.join("drivers:available:" + city);
      socket.data = { driverId: data.driverId, lat: data.lat, lng: data.lng, vehicleType: data.vehicleType, city };
      console.log(`[Socket] Driver ${data.driverId} online in ${city}`);
    });

    socket.on("driver:offline", () => {
      const city = (socket.data as any)?.city || "بني وليد";
      socket.leave("drivers:available:" + city);
    });

    socket.on("trip:broadcast", (data: { tripId: string; serviceType: string; pickupAddress: string; city: string }) => {
      const city = data.city || "بني وليد";
      globalForSocket.io?.to("drivers:available:" + city).emit("trip:new", {
        tripId: data.tripId, serviceType: data.serviceType, pickupAddress: data.pickupAddress,
      });
      console.log(`[Socket] Trip ${data.tripId} broadcast to ${city}`);
    });

    socket.on("bid:submit", (data: { tripId: string; bid: { id: string; driverId: string; price: number; driverName: string; rating: number; totalTrips: number } }) => {
      socket.join(`trip:${data.tripId}`);
      globalForSocket.io?.to(`trip:${data.tripId}`).emit("bid:update", data.bid);
      console.log(`[Socket] Bid submitted for trip ${data.tripId}: ${data.bid.price} LYD`);
    });

    socket.on("trip:join", (tripId: string) => {
      socket.join(`trip:${tripId}`);
    });

    socket.on("trip:leave", (tripId: string) => {
      socket.leave(`trip:${tripId}`);
    });

    socket.on("bid:accepted", (data: { tripId: string; driverId: string; city: string }) => {
      const city = data.city || "بني وليد";
      globalForSocket.io?.to("drivers:available:" + city).emit("bid:accepted_external", data);
      globalForSocket.io?.to(`trip:${data.tripId}`).emit("bid:accepted", {
        tripId: data.tripId, driverId: data.driverId,
      });
    });

    socket.on("location:update", (data: { tripId: string; lat: number; lng: number }) => {
      globalForSocket.io?.to(`trip:${data.tripId}`).emit("location:changed", {
        lat: data.lat, lng: data.lng,
      });
    });

    socket.on("disconnect", () => {
      const city = (socket.data as any)?.city || "بني وليد";
      console.log(`[Socket] Disconnected: ${socket.id} (${city})`);
      socket.leave("drivers:available:" + city);
    });
  });

  console.log("[Socket] Server initialized");
  return globalForSocket.io;
}

export function broadcastNewTrip(tripId: string, serviceType: string, pickupAddress: string, city?: string) {
  if (globalForSocket.io) {
    const room = city ? "drivers:available:" + city : "drivers:available";
    globalForSocket.io.to(room).emit("trip:new", { tripId, serviceType, pickupAddress });
  }
}

export function emitBidUpdate(tripId: string, bid: any) {
  if (globalForSocket.io) {
    globalForSocket.io.to(`trip:${tripId}`).emit("bid:update", bid);
  }
}
