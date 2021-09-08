import Busboy from 'busboy';
import { pipeline } from 'stream/promises';
import { logger } from './logger.js';
import fs from 'fs';

export class UploadHandler {
    constructor({ io, socketId, dowloadsFolder, messageTimeDelay = 200 }) {
        this.io = io
        this.socketId = socketId
        this.dowloadsFolder = dowloadsFolder
        this.ON_UPLOAD_EVENT = 'file-upload'
        this.messageTimeDelay = messageTimeDelay
    }

    canExecute(lastExecute) {
        return (Date.now() - lastExecute) > this.messageTimeDelay
    }

    handleFileBytes(filename) {
        this.lastMessageSent = Date.now();

        async function* handleData(source) {
            let processAlready = 0;

            for await (const chunck of source) {
                yield chunck;

                processAlready += chunck.length;

                if(!this.canExecute(this.lastMessageSent)) {
                    continue;
                }

                this.io.to(this.socketId).emit(this.ON_UPLOAD_EVENT, { processAlready, filename })
                logger.info(`File [${filename}] got ${processAlready} bytes to ${this.socketId}`)
            }  
        }

        return handleData.bind(this);
    }

    async onFile(fieldname, file, filename) {
        const saveTo = `${this.dowloadsFolder}/${filename}`

        await pipeline(
            // 1° Pegar um readable stream
            file,
            // 2° Filtrar, converter, transformar dados
            this.handleFileBytes.apply(this, [ filename ]),
            // 3° Saída do processo uma writable stream
            fs.createWriteStream(saveTo)
        )

        logger.info(`File [${filename}] finished`)
    }

    registerEvents(headers, onFinish) {
        const busboy = new Busboy({ headers });
        busboy.on('file', this.onFile.bind(this))
        busboy.on('finish', onFinish);
        
        return busboy
    }
}