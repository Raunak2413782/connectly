import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState
} from "react";

import { io } from "socket.io-client";


const SocketContext = createContext(null);


export function SocketProvider({ children }) {

    const socket = useRef(null);

    // This makes React re-render when socket becomes available
    const [socketRef, setSocketRef] = useState(null);


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

        // Tell React that socket is now available
        setSocketRef(socket);


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

            setSocketRef(null);

        };

    }, []);


    return (

        <SocketContext.Provider value={socketRef}>

            {children}

        </SocketContext.Provider>

    );

}


export function useSocket() {

    return useContext(SocketContext);

}