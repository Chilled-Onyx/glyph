import { createServer, Server } from 'node:http';
import Request                  from './src/request';
import requestListener          from './src/requestListener';
import config                   from './src/config';

const server: Server = createServer({IncomingMessage: Request}, requestListener);

server.listen(config.httpPort);
console.log(`Server started on port ${config.httpPort}`);