import { io } from "socket.io-client";

// One shared connection to the API for real-time order events.
export const socket = io(import.meta.env.VITE_API_URL, {
  transports: ["websocket", "polling"],
});
