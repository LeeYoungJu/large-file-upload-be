import { Server } from 'socket.io';
import UploadService from "./service/upload.js";

export default (server) => {
    const io = new Server(server, {
        transports: ["websocket"],
        cors: {
            origin: "*",
        },
        maxHttpBufferSize: 5e6,
    });

    io.on("connection", (socket) => {
        console.log("connection!!!");
    
        socket.on("upload", (params) => {
            const uploadService = new UploadService(params);
            
            try {
                uploadService.uploadChunk(
                    params.data,
                    () => {
                        socket.emit("uploadComplete", {});
                    },
                    (finalFileName) => {
                        socket.emit("uploadComplete", {finalFileName});
                    }
                );
            } catch(err) {
    
            }
        });
    });
}