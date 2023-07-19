// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); 
const app = express();
const pgp = require('pg-promise')(); 
const bodyParser = require('body-parser');
const session = require('express-session'); 
const bcrypt = require('bcrypt'); 

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

const dbConfig = {
  host: process.env.POSTGRES_HOST,
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  ssl: true
};

const db = pgp(dbConfig);

db.connect()
  .then(obj => {
    console.log('Database connection successful'); 
    obj.done(); 
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

app.set('view engine', 'ejs'); 
app.use(bodyParser.json()); 
app.use(express.static(__dirname + '/')); 

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************

app.get('/', (req, res) => {
  res.redirect('/login'); 
});

app.get('/login', (req, res) => {
  res.render('pages/login');
});

app.get('/register', (req, res) => {
  res.render('pages/register')
});

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try 
  {
    const hash = await bcrypt.hash(password, 10);

    let id = await db.one('INSERT INTO player (username, password, email, total_chips) VALUES ($1, $2, $3, $4) RETURNING id', [username, hash, email, 2000]);

    res.redirect('/login');

  } catch (error) 
  {
    res.redirect('/register');
  }

});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try 
  {
    const player = await db.oneOrNone('SELECT * FROM player WHERE username = $1', username);

    if (!player) return res.redirect('/register');

    const passwordMatch = await bcrypt.compare(password, player.password);

    if (!passwordMatch){throw new Error('Incorrect username or password.');}

    req.session.user = player;
    req.session.save();

    res.redirect('/table');

  } catch (error) 
  {
    res.render('pages/login', { message: 'Incorrect username or password.' });
  }
});

const auth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

app.use(auth);

app.get('/table', auth, (req, res) => {
  res.render('pages/table'); 
});

app.get('/profile', auth, (req, res) => {
  res.render('pages/profile'); 
});

app.get('/logout', (req, res) => {
  req.session.destroy(); 
  res.render('pages/login', { message: 'Logged out Successfully' });
});

// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************

app.listen(4000);
console.log('Server is listening on port 4000');