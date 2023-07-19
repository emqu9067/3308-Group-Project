const express = require('express');
const app = express();
var path = require('path');
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session');
require('dotenv').config();
app.set('views', path.join(__dirname, '/views'));

// db config
const dbConfig = {
  host: process.env.POSTGRES_HOST,
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  ssl: true
};

const db = pgp(dbConfig);

// db test
db.connect()
  .then((obj) => {
    // Can check the server version here (pg-promise v10.1.0+):
    console.log("Database connection successful");
    obj.done(); // success, release the connection;
  })
  .catch((error) => {
    console.log("ERROR:", error.message || error);
  });

// set the view engine to ejs
app.set("view engine", "ejs");
app.use(bodyParser.json());

// set session
app.use(
  session({
    secret: "XASDASDA",
    saveUninitialized: true,
    resave: true,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const user = {
  username: undefined,
  email: undefined,
  chips: undefined,
};

app.post('/register_user', function(req, res){

   var username = req.body.username;
   var password = req.body.password;
   var email = req.body.email;
   var total_chips = 0;

   const query = `INSERT INTO player (id, username, password, email, total_chips) VALUES (DEFAULT, '${username}', '${password}', '${email}', '${total_chips}') returning * ;`

   db.any(query)

   .then(function(data)
   {

     // res.status(201).json({
     //   status: 'success',
     //   data: data,
     //   message: 'Successfully registered user',
     // })
      user.username = username;
      user.email = email;
      user.chips = total_chips;

      req.session.user = user;
      req.session.save();

     res.redirect("/");
   })
   .catch(function(err){
     return console.log(err);
   });
});

app.get("/login", (req, res) => {
  res.render('pages/login');
});

// Login submission
app.post("/login", (req, res) => {
  const email = req.body.email;
  const username = req.body.username;
  const query = "select * from player where player.email = $1";
  const values = [email];

  // get the student_id based on the emailid
  db.one(query, values)
    .then((data) => {
      user.username = username;
      user.email = data.email;
      user.chips = data.total_chips;

      req.session.user = user;
      req.session.save();

      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/login");
    });
});

// Authentication middleware.
const auth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
};

app.use(auth);

app.get("/", (req, res) => {
  res.render("pages/home", {
    username: req.session.user.username,
    email: req.session.user.email,
    chips: req.session.user.chips,
  });
});


app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/logout");
});







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









app.listen(4000);
console.log("Server is listening on port 4000");
