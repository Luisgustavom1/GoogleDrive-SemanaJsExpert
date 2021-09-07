import https from 'https';
import { logger } from './logger.js';
import fs from 'fs';
import { Server } from 'socket.io';
import Routes from './routes.js';

const PORT = process.env.PORT || 5000;

const localHostSSL = {
    key: fs.readFileSync('./certificates/key.pem'),
    cert: fs.readFileSync('./certificates/cert.pem'),
};

const routes = new Routes();

const server = https.createServer(
    localHostSSL,
    routes.handler.bind(routes)
);

const io = new Server(server, {
    cors: {
        origin: '*',
        credentials: false
    }
})

routes.setSocketInstance(io);

io.on('connection', (socket) => logger.info(`Someone connect: ${io.id}`))

const startServer = () => {
    const { port, address } = server.address();

    logger.info(`app running in the http://${address}:${port}`)
};

server.listen(PORT, startServer);