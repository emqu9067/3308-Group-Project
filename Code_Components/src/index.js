// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); 
const app = express();
const pgp = require('pg-promise')(); 
const bodyParser = require('body-parser');
const session = require('express-session'); 
const bcrypt = require('bcrypt'); 
const moment = require('moment');
const http = require('http');

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
  res.redirect('/login', { session: req.session }); 
});

app.get('/login', (req, res) => {
  res.render('pages/login', { session: req.session });
});

app.get('/register', (req, res) => {
  res.render('pages/register', { session: req.session })
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

app.get('/table', auth, async (req, res) => {
  try {
    // Check if the user has an active session
    if (req.session.sessionId) {
      // Update the end_time of the existing session
      const endTime = moment().format();
      await db.none('UPDATE session SET end_time = $1 WHERE id = $2', [endTime, req.session.sessionId]);
    } else {
      // Insert a new session entry
      const startTime = moment().format();
      const result = await db.one('INSERT INTO session (player_id, start_time) VALUES ($1, $2) RETURNING id', [req.session.user.id, startTime]);
      req.session.sessionId = result.id; // Store the session ID in the session object
    }

    res.render('pages/table', { session: req.session });
  } catch (error) {
    console.log('Error:', error);
    res.redirect('/login');
  }
});

app.get('/profile', auth, (req, res) => {
  res.render('pages/profile', { session: req.session }); 
});

app.get('/logout', async (req, res) => {
  try {
    // Update the end_time of the active session
    if (req.session.sessionId) {
      const endTime = moment().format();
      await db.none('UPDATE session SET end_time = $1 WHERE id = $2', [endTime, req.session.sessionId]);
    }

    req.session.destroy();
    res.render('pages/login', { message: 'Logged out Successfully' , session: req.session });
  } catch (error) {
    console.log('Error:', error);
    res.redirect('/login');
  }
});

app.post('/update-end-time', async (req, res) => {
  try {
    const { sessionId } = req.body;
    const endTime = moment().format();
    await db.none('UPDATE session SET end_time = $1 WHERE id = $2', [endTime, sessionId]);
    res.sendStatus(200);
  } catch (error) {
    console.log('Error:', error);
    res.sendStatus(500);
  }
});

// *****************************************************
// <!-- Section 5 : Start Server-->  
// *****************************************************

app.listen(4000);
console.log('Server is listening on port 4000'); 