import { Server } from 'socket.io';

// Setup WebSocket server using Socket.io
const io = new Server(3000, { /* options */ });

// Event for a new client connection
io.on('connection', (socket) => {
    console.log('New client connected');

    // Example event to handle messages from clients
    socket.on('message', (data) => {
        console.log('Message from client:', data);
        // Broadcast message to all connected clients
        io.emit('message', data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

export default io;
