import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";
import md5 from "md5";
import fsPromises from 'fs/promises';

const app = express();
app.use(bodyParser.raw({type: 'application/octet-stream', limit: '500mb'}));
app.use(cors({
    origin: '*'
}));


app.use('/uploads', express.static('upload'));

app.get('/', (req, res) => {

    res.send('good!');
});

app.post('/upload-sync', (req, res) => {
    const {name, size, curChunkIdx, totalChunks} = req.query;
    const isFirstChunk = parseInt(curChunkIdx) === 0;
    const isLastChunk = parseInt(curChunkIdx) === parseInt(totalChunks) - 1;

    const ext = name.split('.').pop();
    const data = req.body.toString().split(',')[1];
    const buffer = Buffer.from(data, 'base64');

    const tempFileName = `${md5(name + req.ip)}.${ext}`;
    if(isFirstChunk && fs.existsSync(`./upload/${tempFileName}`)) {
        fs.unlinkSync(`./upload/${tempFileName}`);
    }
    fs.appendFileSync(`./upload/${tempFileName}`, buffer);
    if(isLastChunk) {
        const finalFileName = `${md5(Date.now()).substring(0, 6)}.${ext}`;
        fs.renameSync(`./upload/${tempFileName}`, `./upload/${finalFileName}`);
        res.json({
            finalFileName
        });
    } else {
        res.send('ok');
    }
});

app.post('/upload', (req, res) => {
    const {name, size, curChunkIdx, totalChunks} = req.query;
    const isFirstChunk = parseInt(curChunkIdx) === 0;
    const isLastChunk = parseInt(curChunkIdx) === parseInt(totalChunks) - 1;

    const ext = name.split('.').pop();
    const data = req.body.toString().split(',')[1];
    const buffer = Buffer.from(data, 'base64');

    const tempName = md5(name);
    const tempDirPath = './tempUpload';
    const tempFileUploadPath = `${tempDirPath}/${tempName}`;

    if(isFirstChunk) {
        if(!fs.existsSync(tempDirPath)) {
            fs.mkdirSync(tempDirPath);
        }
        if(!fs.existsSync(tempFileUploadPath)) {
            fs.mkdirSync(tempFileUploadPath);
        }
    }

    fsPromises.writeFile(`${tempFileUploadPath}/${curChunkIdx}_${tempName}`, buffer);

    if(isLastChunk) {
        const finalFileName = `${md5(Date.now()).substring(0, 6)}.${ext}`;
        const finalDirPath = './upload';
        const finalFilePath = `${finalDirPath}/${finalFileName}`;
        
        const files = fs.readdirSync(tempFileUploadPath);
        fsPromises.readdir(tempFileUploadPath)
            .then(files => {
                files.sort((a, b) => {
                    return Number(a.split('_')[0]) - Number(b.split('_')[0]);
                });
                if(!fs.existsSync(finalDirPath)) {
                    fs.mkdirSync(finalDirPath);
                }
                
                files.forEach(file => {
                    const data = fs.readFileSync(`${tempFileUploadPath}/${file}`)
                    fs.appendFileSync(finalFilePath, data);
                });
        
                fsPromises.rm(tempFileUploadPath, {recursive: true, force: true})
                    .then(() => {
                        res.json({
                            finalFileName
                        });
                    });
            });
    } else {
        res.send('ok');
    }
});




app.listen(8000);