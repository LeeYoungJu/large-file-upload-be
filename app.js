import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cors from "cors";

import routes from "./routes.js";
import sio_bind from "./sio_bind.js";


const app = express();
app.use(bodyParser.raw({type: 'application/octet-stream', limit: '500mb'}));
app.use(cors({
    origin: '*'
}));
app.use('/uploads', express.static('upload'));


app.get('/', routes.test);
app.post('/upload', routes.upload);



const server = http.createServer(app);
sio_bind(server);

server.listen(8000, () => {
    console.log("listen on port 8000...");
});

