// Backend/sockets/auction.socket.js
export default function setupAuctionSockets(io) {
  io.on('connection', (socket) => {

    // Join a specific auction room
    socket.on('join_auction', (auctionId) => {
      socket.join(auctionId);
    });

    // Leave a specific auction room
    socket.on('leave_auction', (auctionId) => {
      socket.leave(auctionId);
    });

    socket.on('disconnect', () => {
    });
  });
}
