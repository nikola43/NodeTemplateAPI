import * as http from 'http';
import App from './app';
import socketManager from "./managers/SocketManager";

const colors = require('colors');

export class Server {
    public port: any;
    public server: any;
    public ioRooms: any = [];

    constructor() {
        this.port = this.normalizePort(process.env.PORT || 3000);
        App.set('port', this.port);
        this.server = http.createServer(App);
        this.configSocket();
        this.server.listen(this.port, '0.0.0.0')
            .on('error', this.onError)
            .on('listening', () => {
                this.onListening(this.server);
            });
    }

    configSocket() {
        const io = socketManager.io;

        io.on('connection', (socket: any) => {
            console.log(colors.green('Socket ON'));


            socket.on('mensaje', function (msj: any) {
                console.log('emit');
                console.log(msj);
                io.emit('mensaje', msj);
            });

            socket.on('disconnect', function () {
                console.log('Usuario desconectado');
            });

            socket.on('DBEvent', (eventData: any) => {
                console.log(colors.yellow('DBEvent'));
                console.log(colors.yellow(eventData));
                io.emit('mensaje', "sdfdsfsdfsdfsf");
            });


        });

        /*
        io.on('DBEvent', (eventData: any) => {
            const data: EmitModel = eventData;
            console.log(colors.yellow('DBEvent'));
            console.log(colors.yellow(data));
            if (eventData.action === 'InsertCenterTypeModel') {
                console.log('New Center Created Successfully');
                console.log(colors.blue(eventData.data));

                // socket.join(emit.data.incidenceRoomId);
            }
            io.emit('DBEvent', eventData);
        });

        */
    }

    normalizePort(val: number | string): number | string | boolean {
        let port: number = (typeof val === 'string') ? parseInt(val, 10) : val;
        if (isNaN(port)) return val;
        else if (port >= 0) return port;
        else return false;
    }

    onError(error: NodeJS.ErrnoException): void {
        if (error.syscall !== 'listen') throw error;
        const port = this.normalizePort(process.env.PORT || 3000);
        let bind = (typeof port === 'string') ? 'Pipe ' + port : 'Port ' + port;
        switch (error.code) {
            case 'EACCES':
                console.error(`${bind} requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(`${bind} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    onListening(server: any): void {
        let addr = server.address();
        let bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`;
        console.log(`listening on ${bind}`);
    }
}

const server = new Server();
export default server;
