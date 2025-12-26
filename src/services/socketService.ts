import { io, Socket } from 'socket.io-client';

// Define the URL for the socket server
// In production, this should be an environment variable
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class SocketService {
    private static instance: SocketService;
    private socket: Socket | null = null;

    private constructor() { }

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    public connect(userId: string): Socket {
        if (!this.socket) {
            this.socket = io(SOCKET_URL, {
                transports: ['websocket'],
                reconnection: true,
            });

            this.socket.on('connect', () => {
                console.log('Socket connected:', this.socket?.id);
                if (userId) {
                    this.socket?.emit('join', userId);
                }
            });

            this.socket.on('disconnect', () => {
                console.log('Socket disconnected');
            });

            this.socket.on('connect_error', (err) => {
                console.error('Socket connection error:', err);
            });
        }
        return this.socket;
    }

    public getSocket(): Socket | null {
        return this.socket;
    }

    public disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    public joinRoom(userId: string): void {
        if (this.socket) {
            this.socket.emit('join', userId);
        }
    }
}

export const socketService = SocketService.getInstance();
