import FileHelper from "./fileHelper.js";
import { logger } from "./logger.js";
import { dirname, resolve } from 'path';
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultDownloadsFolder = resolve(__dirname, '../', 'downloads');

export default class Routes {
    io
    constructor(downloadsFolder = defaultDownloadsFolder) {
        this.downloadsFolder = downloadsFolder
        this.fileHelper = FileHelper
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

    async post(req, res) {
        logger.info('post method')
        res.end()
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