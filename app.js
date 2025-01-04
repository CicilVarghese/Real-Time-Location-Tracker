const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const server = http.createServer(app);
const io = socketio(server);

app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// for connection
io.on('connection', (socket) => {
    console.log("New WebSocket connection");

    socket.on("register_device", (data) => {
        console.log(`Device ID registered: ${data.deviceId}`);
        // You can store this ID in a database or manage it as needed
    });

    socket.on('send_location', (coords) => {
        console.log(`Location received from ${coords.deviceId}: Latitude ${coords.lat}, Longitude ${coords.long}`);
        io.emit('receive-location', { id: socket.id, ...coords });
    });

    socket.on('disconnect', () => {
        console.log(`Device with ID ${socket.id} disconnected`);
        io.emit('user_disconnected', socket.id);
    });
});

app.get("/", (req, res) => {
    res.render("index");
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
