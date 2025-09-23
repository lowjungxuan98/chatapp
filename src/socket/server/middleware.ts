import { Server } from "socket.io";
import type { ClientToServer, ServerToClient, InterServer, SocketData } from "@/types";
import { logger } from "@/lib/logger";

export function middleware(io: Server<ClientToServer, ServerToClient, InterServer, SocketData>) {
    // Room emissions logging
    const originalTo = io.to;
    io.to = function (room: string) {
        const roomEmitter = originalTo.call(this, room);
        const originalEmit = roomEmitter.emit;
        roomEmitter.emit = function (event: any, ...args: any[]) {
            logger.info("📡 Server → Room", { event, room, args: args.length ? args : "no data" });
            return (originalEmit as any).call(this, event, ...args);
        };
        return roomEmitter;
    };

    io.use((socket, next) => {
        logger.info("🔌 Socket Connected", {
            socketId: socket.id, userId: socket.data.userId, username: socket.data.username
        });

        socket.onAny(async (event, ...args) => {
            logger.info("📥 Client → Server", { event, args: args.length ? args : "no data", socketId: socket.id });
            const rooms = await io.fetchSockets();
            const roomMap = new Map();
            rooms.forEach(s => {
                s.rooms.forEach(room => {
                    if (room !== s.id) {
                        if (!roomMap.has(room)) {
                            roomMap.set(room, []);
                        }
                        roomMap.get(room)?.push(s.id);
                    }
                });
            });
            logger.info("🏠 Room Status", {
                totalRooms: roomMap.size,
                rooms: Object.fromEntries(roomMap)
            });
        });

        const originalEmit = socket.emit;
        socket.emit = function (event: any, ...args: any[]) {
            logger.info("📤 Server → Client", { event, args: args.length ? args : "no data", socketId: socket.id });
            return (originalEmit as any).call(this, event, ...args);
        };

        next();
    });
}
