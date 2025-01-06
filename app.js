const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const server = http.createServer(app);
const io = socketio(server);

mongoose.connect('mongodb://localhost:27017/realtimeloc');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Authentication routes
app.get('/signup', (req, res) => {
    res.render('signup');
});

// In the '/signup' route
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

// In the '/login' route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user._id;
        res.redirect('/');
    } else {
        res.send('Wrong credentials');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    } else {
        res.redirect('/login');
    }
}

app.get("/", isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.userId);
    console.log(user);
    res.render("index", { user });
    
});

// Socket.io connection
io.on('connection', (socket) => {
    console.log("New WebSocket connection");

    socket.on("register_device", (data) => {
        console.log(`Email registered: ${data.email}`);
    });
    

    socket.on("send_location", (coords) => {
        console.log(JSON.stringify({ email: coords.email, lat: coords.lat, long: coords.long }));
        io.emit('receive-location', { id: socket.id, email: coords.email, lat: coords.lat, long: coords.long });
    });
    
    

    socket.on('disconnect', () => {
        console.log(`User with ID ${socket.id} disconnected`);
        io.emit('user_disconnected', socket.id);
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
