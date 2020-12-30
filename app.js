require('dotenv').config();
// express initialisation
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const socketcon = require('./server/socket/socketcon');
io.on('connection', socketcon);

app.use(express.static('public'));
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// API routes
app.use('/',
    [
        require('./server/routes/admin_route'),
        require('./server/routes/franchise_route')
    ]
);

app.use(function (req, res, next) {
    res.status(404).sendFile(__dirname + '/public/404.html');
});

// Error handling
app.use(function (err, req, res, next) {
    console.log(err);
    res.status(500).send('Internal Server Error');
});

server.listen('3000', () =>
    console.log('Oh yes! Server is running!')
);

