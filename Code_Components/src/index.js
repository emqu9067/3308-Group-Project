// **************
// Dependencies
// **************

const express = require('express');
const bodyParser = require('body-parser');
const pgp = require('pg-promise')();
require('dotenv').config();

const http = require('http');
const Card = require('./card.js');
const Table = require('./table.js');
// **************
// Initialization (copied from lab 7)
// **************

// defining the Express app
const app = express();
// using bodyParser to parse JSON in the request body into JS objects
app.use(bodyParser.json());
// Database connection details
const dbConfig = {
  host: process.env.POSTGRES_HOST,
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  ssl: true
};
// Connect to database using the above details
const db = pgp(dbConfig);


const port = 4000;
const baseUrl = `http://localhost:${port}`;


const homePage = `<!DOCTYPE html>
   <html lang="en">
   <head>
      <meta charset="UTF-8">
      <title>My Main Page</title>
   </head>
   <body>
      <h1>My Main Page</h1>
   </body>
   </html>`;


http.createServer(function (req, response) {
   //console.log(req);
   response.writeHead(200, {'Content-Type': 'text/html'});


   response.write(homePage);


   response.end();
})
app.listen(port, '0.0.0.0');
console.log('Server running at http://localhost:' + port);

// **************
// Endpoints
// **************

// Default

// <!-- Endpoint 1 :  Default endpoint ("/") -->
const message = 'Hello';
app.get('/', (req, res) => {
  res.send(message);
});

app.post('/register_user', function(req, res) {

   var username = req.body.username;
   var password = req.body.password;
   var email = req.body.email;
   var total_chips = 0;

   const query = `INSERT INTO player (id, username, password, email, total_chips) VALUES (DEFAULT, '${username}', '${password}', '${email}', '${total_chips}');`

   db.any(query)

   .then(function(data)
   {
     res.status(201).json({
       status: 'success',
       data: data,
       message: 'Successfully registered user',
     });
   })

   .catch(function(err){
     return console.log(err);
   });
})

app.get('/check_username', function(req, res) {

   var username = req.query.username;

   const query = `SELECT * FROM player WHERE username = '${username}';`

      db.any(query)

   .then(function(data)
   {
      if(data.length == 0)
      {
         res.status(200).json({
            status: 'available',
            message: 'Username is available.',
            })
      }
      else{
         res.status(200).json({
         status: 'taken',
         message: 'Username is taken.',
         })
      }
   })

   .catch(function(err){
     return console.log(err);
   });
})

app.get('/check_email', function(req, res) {

   var email = req.query.email;

   const query = `SELECT * FROM player WHERE email = '${email}';`

      db.any(query)

   .then(function(data)
   {
      if(data.length == 0)
      {
         res.status(200).json({
            status: 'available',
            message: 'Email is not used by an existing account.',
            })
      }
      else{
         res.status(200).json({
         status: 'taken',
         message: 'Email is used by an existing account.',
         })
      }
   })

   .catch(function(err){
     return console.log(err);
   });
})