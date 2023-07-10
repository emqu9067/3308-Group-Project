const express = require("express");
const app = express();
const pgp = require("pg-promise")();
const bodyParser = require("body-parser");
const session = require("express-session");

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
  student_id: undefined,
  username: undefined,
  first_name: undefined,
  last_name: undefined,
  email: undefined,
  year: undefined,
  major: undefined,
  degree: undefined,
};

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

app.get("/login", (req, res) => {
  res.render("pages/login");
});

// Login submission
app.post("/login", (req, res) => {
  const email = req.body.email;
  const username = req.body.username;
  const query = "select * from students where students.email = $1";
  const values = [email];

  // get the student_id based on the emailid
  db.one(query, values)
    .then((data) => {
      user.student_id = data.student_id;
      user.username = username;
      user.first_name = data.first_name;
      user.last_name = data.last_name;
      user.email = data.email;
      user.year = data.year;
      user.major = data.major;
      user.degree = data.degree;

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
    first_name: req.session.user.first_name,
    last_name: req.session.user.last_name,
    email: req.session.user.email,
    year: req.session.user.year,
    major: req.session.user.major,
    degree: req.session.user.degree,
  });
});


app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/logout");
});

app.listen(4000);
console.log("Server is listening on port 4000");
