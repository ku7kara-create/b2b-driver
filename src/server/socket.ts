import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import type { Socket } from "socket.io";

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

  io.on("connection", (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    socket.on("driver:available", (data: { driverId: string; lat: number; lng: number }) => {
      socket.join("drivers:available");
      socket.data = { driverId: data.driverId, lat: data.lat, lng: data.lng };
    });

    socket.on("trip:new", (tripId: string) => {
      io?.to("drivers:available").emit("trip:new", { tripId });
    });

    socket.on("bid:submit", (data: { tripId: string; bid: any }) => {
      socket.join(`trip:${data.tripId}`);
      io?.to(`trip:${data.tripId}`).emit("bid:update", data.bid);
    });

    socket.on("bid:accept", (data: { tripId: string; driverId: string }) => {
      io?.to(`trip:${data.tripId}`).emit("bid:accepted", { driverId: data.driverId });
    });

    socket.on("location:update", (data: { tripId: string; lat: number; lng: number }) => {
      io?.to(`trip:${data.tripId}`).emit("location:changed", {
        lat: data.lat,
        lng: data.lng,
      });
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}
