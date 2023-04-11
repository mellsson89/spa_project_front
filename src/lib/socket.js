import {io} from "socket.io-client";


export const socket = io("https://spa-backend.pp.ua");

console.log(socket)