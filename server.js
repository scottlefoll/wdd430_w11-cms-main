// Get dependencies
var express = require('express');
var path = require('path');
var http = require('http');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { MongoClient, ServerApiVersion } = require('mongodb');
var mongoose = require('mongoose');
const Contact = require('./server/models/contact');

// import the routing file to handle the default (index) route
var index = require('./server/routes/app');
const messageRoutes = require('./server/routes/messages');
const contactRoutes = require('./server/routes/contacts');
const documentRoutes = require('./server/routes/documents');
// const authenticationRoutes = require('./server/routes/authentication');

const dotEnv = require('dotenv').config();
const uri = process.env.DB_URL;

// ... ADD CODE TO IMPORT YOUR ROUTING FILES HERE ...
var app = express(); // create an instance of express

// establish a connection to the mongo database
mongoose.connect(uri)
  .then(() =>
    console.log('Connected to database!')
  )
  .catch(err =>
    console.log('Connection failed:', err)
  );

// Must be the first middleware loaded in order to log results from other middleware
app.use(logger('dev')); // Tell express to use the Morgan logger

// Tell express to use the following parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

// Add support for CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, PUT, DELETE, OPTIONS'
  );
  next();
});

// Set up the static file route for express to use as the
// root directory for your web site
app.use(express.static(path.join(__dirname, 'dist/cms/browser')));

// Set up the API route
// tell express to map the default route ('/') to the index route
app.use('/', index);
app.use('/api/', index);
app.use('/api/messages', messageRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/documents', documentRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/cms/browser/index.html'));
});

// Define the port address and tell express to use this port
const port = process.env.PORT || '3000';

app.set('port', port);

// Create HTTP server.
const server = http.createServer(app);

// Tell the server to start listening on the provided port
server.listen(port, function() {
  console.log('API running on localhost: ' + port)
});
