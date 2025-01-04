// The axios library is used on the server-side in your Node.js application, not in the client-side script.js. Here is a summary of where axios is used:

// Server-side (app.js): This is where you use axios to send the location data to your friend's Django server.
// Here is the relevant part of the server-side code using axios:

const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const axios = require('axios'); // Import axios
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

        // Send location data to your friend's server
        axios.post('http://your-friends-server-url/api/location', {
            deviceId: coords.deviceId,
            latitude: coords.lat,
            longitude: coords.long
        })
        .then(response => {
            console.log('Location data sent to friend\'s server:', response.data);
        })
        .catch(error => {
            console.error('Error sending location data:', error);
        });
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