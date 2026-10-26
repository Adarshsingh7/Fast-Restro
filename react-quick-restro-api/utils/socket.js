const { Server } = require('socket.io');

let io;

// Rooms:
//   restro:<ownerId>  - the restaurant dashboard, gets every order of that restaurant
//   order:<orderId>   - a customer tracking a single order
exports.init = (server) => {
  io = new Server(server, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    socket.on('join:restro', (id) => id && socket.join(`restro:${id}`));
    socket.on('join:order', (id) => id && socket.join(`order:${id}`));
    socket.on('leave:order', (id) => id && socket.leave(`order:${id}`));
  });

  return io;
};

exports.emitOrder = (event, order) => {
  if (!io || !order) return;
  const target = order.owner
    ? io.to(`restro:${order.owner}`).to(`order:${order._id}`)
    : io.to(`order:${order._id}`);
  target.emit(event, order);
};
