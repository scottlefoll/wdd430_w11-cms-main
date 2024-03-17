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
// mongoose.connect(uri,
//    { useNewUrlParser: true }, (err, res) => {
//       if (err) {
//          console.log('Connection failed: ' + err);
//       }
//       else {
//          console.log('Connected to database!');

//          // Fetch all contacts from the database
//           Contact.find({}, (err, contacts) => {
//             if (err) {
//               console.error('Error fetching contacts:', err);
//             } else {
//               console.log('Contacts retrieved from the database:', contacts);
//             }
//           });
//       }
//    }
// );

// const dbConn = mongoose.connection;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // Fetch all contacts from the database
    Contact.find({}, (err, contacts) => {
      if (err) {
        console.error('Error fetching contacts:', err);
      } else {
        console.log('Contacts retrieved from the database:', contacts);
      }
    });

  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

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
app.use('/messages', messageRoutes);
app.use('/contacts', contactRoutes);
app.use('/documents', documentRoutes);

// Alternative to the below catch-all route, you can use the following middleware
// Purpose: This middleware attempts to render a view named index.
// This implies that your server is set up to use a template engine
// (e.g., EJS, Pug) to generate HTML dynamically.

// Behavior: Without additional configuration specifying where and
// how to find the index view, this middleware might not function
// as intended, especially in an Angular application context where
// index.html is a static file, not a template to be rendered server-side.

// Usage: More common in server-rendered applications where the
// server dynamically generates HTML content based on templates.
// It's not typically used in SPA scenarios where static files are
// served as the entry point to the application:
// app.use((req, res, next) => {
//   res.render('index');
// });

//  Tell express to map all other non-defined routes back to the index page
// This way the front-end routing library can handle the route
// This should be after your API and routes setup to catch any unhandled routes
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
