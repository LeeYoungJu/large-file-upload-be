import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";
import md5 from "md5";

const app = express();
app.use(bodyParser.raw({type: 'application/octet-stream', limit: '500mb'}));
app.use(cors({
    origin: '*'
}));


app.use('/uploads', express.static('upload'));

app.get('/', (req, res) => {

    res.send('good!');
});

app.post('/upload', (req, res) => {
    const {name, size, curChunkIdx, totalChunks} = req.query;
    const firstChunk = parseInt(curChunkIdx) === 0;
    const lastChunk = parseInt(curChunkIdx) === parseInt(totalChunks) - 1;

    const ext = name.split('.').pop();
    const data = req.body.toString().split(',')[1];
    const buffer = Buffer.from(data, 'base64');

    const tempFileName = `${md5(name + req.ip)}.${ext}`;
    if(firstChunk && fs.existsSync(`./upload/${tempFileName}`)) {
        fs.unlinkSync(`./upload/${tempFileName}`);
    }
    fs.appendFileSync(`./upload/${tempFileName}`, buffer);
    if(lastChunk) {
        const finalFileName = `${md5(Date.now()).substring(0, 6)}.${ext}`;
        fs.renameSync(`./upload/${tempFileName}`, `./upload/${finalFileName}`);
        res.json({
            finalFileName
        });
    } else {
        res.send('ok');
    }
});


app.listen(8000);