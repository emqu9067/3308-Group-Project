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
  if(req.session){
    res.render('pages/table', { session: req.session });
  } else {
    res.redirect('/login');
  }
});

/*------------
Table APIs below
------------*/

app.post('/table/begin_session', function(req, res) {
  var player_id = req.session.user.id;
  var start_time = new Date(Date.now()).toISOString();

  const query = `INSERT INTO session (id, player_id, start_time, end_time) VALUES (DEFAULT, '${player_id}', '${start_time}', NULL);`
  console.log(query)
  db.any(query)

  .then(function(data)
  {
     res.status(200).json({
        status: 'success',
        message: 'Began session.',
        session_id: data.id
     })
  })
  .catch(function(err){
     return console.log(err);
  })
})

app.get('/table/get_current_session', function(req, res)
{
   var player_id = req.session.user.id;

   const query = `SELECT * FROM session WHERE player_id = ${player_id} AND end_time IS NULL ORDER BY start_time DESC LIMIT 1;`
   console.log(query);
   
   test = db.one(query)
      .then(function(data)
      {
         res.status(200).json({
            status: 'success',
            session_id: data.id
         })
      })
      .catch(function(err){
         console.log(err);
      });
});

app.post('/table/update_session', function(req, res) {
  var session_id = req.body.session_id;
  var end_time = new Date(Date.now()).toISOString();

  console.log("updated session");
  const query = `UPDATE session SET end_time = '${end_time}' WHERE id = '${session_id}';`
  db.any(query)

  .then(function(data)
  {
     res.status(200).json({
        status: 'success',
        message: 'Ended session.',
     })
  })
  .catch(function(err){
     return console.log(err);
  })
})

app.post('/table/add_hand', function(req, res) {
  var session_id = req.body.session_id;
  var player_id = req.session.user.id;
  var bet_amount = req.body.bet_amount;
  var is_winner = req.body.is_winner;

  const query = `INSERT INTO hand (id, session_id, player_id, bet_amount, is_winner) VALUES (DEFAULT, '${session_id}', '${player_id}', '${bet_amount}', '${is_winner}') RETURNING id;`

  db.any(query)

  .then(function(data)
  {
     res.status(200).json({
        status: 'success',
        message: 'Added hand to database.',
        hand_id: data[0].id
     });
  })
  .catch(function(err){
     return console.log(err);
  })
})

app.post('/table/add_card_to_hand', function(req, res) {
  var hand_id = req.body.hand_id;
  var suit = req.body.suit;
  var rank = req.body.rank;
  var dealer_hand = req.body.dealer_hand;

  const query = `INSERT INTO card (id, hand_id, suit, rank, dealer_hand) VALUES (DEFAULT, '${hand_id}', '${suit}', '${rank}', '${dealer_hand}');`

  db.any(query)

  .then(function(data)
  {
     res.status(200).json({
        status: 'success',
        message: 'Added card to database.',
     })
  })
  .catch(function(err){
     return console.log(err);
  })
})

app.post('/table/update_winner', function(req, res) {
  var hand_id = req.body.hand_id;

  const query = `UPDATE hand SET is_winner = 1 WHERE id = ${hand_id};`

  db.any(query)
  .then(function()
  {
    res.status(200).json({
      status: 'OK',
      message: 'Updated database'
    })
  })
  .catch(function(err) {
    console.log(err);
  })
})

app.post('/table/update_loser', function(req, res) {
  var hand_id = req.body.hand_id;

  const query = `UPDATE hand SET is_winner = -1 WHERE id = ${hand_id};`

  db.any(query)
  .then(function()
  {
    res.status(200).json({
      status: 'OK',
      message: 'Updated database'
    })
  })
  .catch(function(err) {
    console.log(err);
  })
})
/*------------
Table APIs above
------------*/

app.get('/profile', auth, async (req, res) => {
  try {
    const player_id = req.session.user.id;
    console.log(player_id);

    // Get the player's win/loss data from the database
    const queryWinLoss = `
      SELECT 
        SUM(CASE WHEN is_winner = 1 THEN 1 ELSE 0 END) AS wins,
        SUM(CASE WHEN is_winner = -1 THEN 1 ELSE 0 END) AS losses,
        SUM(CASE WHEN is_winner = 0 THEN 1 ELSE 0 END) AS ties
      FROM hand
      WHERE player_id = $1;
    `;

    const { wins, losses, ties } = await db.one(queryWinLoss, [player_id]);

    console.log("Wins:", wins);
    console.log("Losses:", losses);
    console.log("Ties:", ties);

    // Get the player's hands played data from the database
    const queryHandsPlayed = `
      SELECT COUNT(*) AS hands_played
      FROM hand
      WHERE player_id = $1;
    `;

    const { hands_played: handsPlayed } = await db.one(queryHandsPlayed, [player_id]);

    console.log("Hands Played:", handsPlayed);

    // Get the most common cards dealt to the player from the database
    const queryMostCommonCards = `
      SELECT card_name, COUNT(*) AS frequency
      FROM (
        SELECT 
          CASE
            WHEN suit = 'C' THEN '♣' || rank
            WHEN suit = 'D' THEN '♦' || rank
            WHEN suit = 'H' THEN '♥' || rank
            WHEN suit = 'S' THEN '♠' || rank
            ELSE rank
          END AS card_name
        FROM card
        WHERE dealer_hand = 0 AND hand_id IN (
          SELECT id
          FROM hand
          WHERE player_id = $1
        )
      ) AS card_names
      GROUP BY card_name
      ORDER BY frequency DESC
      LIMIT 10;
    `;

    const mostCommonCards = await db.any(queryMostCommonCards, [player_id]);

    console.log("Most Common Cards:", mostCommonCards);

    res.render('pages/profile', { 
      session: req.session, 
      wins, 
      losses, 
      ties, 
      handsPlayed, 
      mostCommonCards
    });
  } catch (error) {
    console.log('Error:', error);
    res.redirect('/login');
  }
});

app.get('/logout', async (req, res) => {
  try {
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

// *****************************************************
// <!-- Section 5 : Start Server-->  
// *****************************************************

app.listen(4000);
console.log('Server is listening on port 4000'); 