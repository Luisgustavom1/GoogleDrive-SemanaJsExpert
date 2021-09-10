import FileHelper from "./fileHelper.js";
import { logger } from "./logger.js";
import { UploadHandler } from './uploadHandler.js'
import { dirname, resolve } from 'path';
import { fileURLToPath, parse } from "url";
import { pipeline } from "stream/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultDownloadsFolder = resolve(__dirname, '../', 'downloads');

export default class Routes {
    constructor(downloadsFolder = defaultDownloadsFolder) {
        this.downloadsFolder = downloadsFolder
        this.fileHelper = FileHelper
        this.io = {}
    }

    setSocketInstance(io) {
        this.io = io
    }

    async defaultRoutes(req, res) {
        res.end('Rota inexistent [404]')
    }

    async options(req, res) {
        res.writeHead(204);
        res.end('Rota options')
    }

    async post(request, response) {
        const { headers } = request

        const { query: { socketId } } = parse(request.url, true)
        const uploadHandler = new UploadHandler({
            socketId,
            io: this.io,
            downloadsFolder: this.downloadsFolder
        })

        const onFinish = (response) => () => {
            response.writeHead(200)
            const data = JSON.stringify({ result: 'Files uploaded with success!' })
            response.end(data)
        }

        const busboyInstance = uploadHandler.registerEvents(
            headers,
            onFinish(response)
        )

        await pipeline(
            request,
            busboyInstance
        )

        logger.info('Request finished with success!')
    }

    async get(req, res) {
        const files = await this.fileHelper.getFilesStatus(this.downloadsFolder);

        res.writeHead(200)
        res.end(JSON.stringify(files))
    }

    handler(req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        const chosen = this[req.method.toLowerCase()] || this.defaultRoutes;
        
        return chosen.apply(this, [req, res])
    }
}