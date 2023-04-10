import {io} from "socket.io-client";

export const socket = io("https://spa-project-backend.vercel.app",{
    withCredentials: true,
    extraHeaders: {
        "my-custom-header": "abcd"
    }
});