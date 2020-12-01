// require('dotenv').config();

// express initialisation
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(express.static('public'));
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// API routes
app.use('/',
    [
        require('./server/routes/admin_route')
    ]
)

app.listen('3000', () =>
    console.log('Oh yes! Server is running!')
);