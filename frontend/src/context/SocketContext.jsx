import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {

    const socket = useRef(null);

    useEffect(() => {

        const token = localStorage.getItem("token");

        if (!token) {
            return;
        }

        const newSocket = io("http://localhost:3000", {
            auth: {
                token: token
            }
        });

        socket.current = newSocket;

        newSocket.on("connect", () => {

            console.log(
                "🟢 Global socket connected:",
                newSocket.id
            );

        });

        newSocket.on("disconnect", () => {

            console.log(
                "🔴 Global socket disconnected"
            );

        });

        return () => {

            console.log(
                "🔴 Closing global socket"
            );

            newSocket.disconnect();

            socket.current = null;

        };

    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );

}

export function useSocket() {

    return useContext(SocketContext);

}