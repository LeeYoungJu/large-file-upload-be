import fs from "fs";
import md5 from "md5";
import fsPromises from 'fs/promises';

export default class UploadService {
    constructor(params) {
        const {name, md5Name, size, curChunkIdx, totalChunks} = params;

        this.name = name;
        this.tempName = md5Name;
        // this.tempName = md5(name);
        this.size = size;
        this.curChunkIdx = curChunkIdx;
        this.totalChunks = totalChunks;

        this.isFirstChunk = parseInt(curChunkIdx) === 0;
        this.isLastChunk = parseInt(curChunkIdx) === parseInt(totalChunks) - 1;

        this.ext = name.split('.').pop();        
        
        this.tempDirPath = './tempUpload';
        this.tempFileUploadPath = `${this.tempDirPath}/${this.tempName}`;
    }

    isFirst() {
        return this.isFirstChunk;
    }

    async uploadChunk(data, callbackFunc, lastCallbackFunc) {
        if(this.isFirst()) {
            if(!fs.existsSync(this.tempDirPath)) {
                fs.mkdirSync(this.tempDirPath);
            }
            if(!fs.existsSync(this.tempFileUploadPath)) {
                fs.mkdirSync(this.tempFileUploadPath);
            }
        }
        const buffer = Buffer.from(data.substring(data.indexOf(',')+1), 'base64');
        const filePath = `${this.tempFileUploadPath}/${this.curChunkIdx}_${this.tempName}`;
        await fsPromises.writeFile(filePath, buffer);
        
        if(this.isLastChunk) {
            const finalFileName = `${md5(Date.now()).substring(0, 6)}.${this.ext}`;
            const finalDirPath = './upload';
            const finalFilePath = `${finalDirPath}/${finalFileName}`;
            
            const files = await fsPromises.readdir(this.tempFileUploadPath);
            files.sort((a, b) => {
                return Number(a.split('_')[0]) - Number(b.split('_')[0]);
            });
            if(!fs.existsSync(finalDirPath)) {
                fs.mkdirSync(finalDirPath);
            }
            
            files.forEach(file => {
                const data = fs.readFileSync(`${this.tempFileUploadPath}/${file}`)
                fs.appendFileSync(finalFilePath, data);
            });

            await fsPromises.rm(this.tempFileUploadPath, {recursive: true, force: true})
            lastCallbackFunc(finalFileName);
        } else {
            callbackFunc();
        }
    }
}