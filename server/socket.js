// socket.js
const { Server } = require('socket.io');

class SocketSingleton {
  constructor(httpServer) {
    if (!SocketSingleton.instance) {
      this.io = new Server(httpServer, {
        cors: {
          origin: ['http://localhost:5173', '172.30.96.1:5173', '192.168.16.78:5173'],
          credentials: true,
        }
      });
      SocketSingleton.instance = this;
    }

    return SocketSingleton.instance;
  }

  onConnection(callback) {
    this.io.on('connection', callback);
  }

  emit(event, data) {
    this.io.emit(event, data);
  }

  sendToClient(clientId, event, data) {
    this.io.to(clientId).emit(event, data);
  }


}

module.exports = SocketSingleton;