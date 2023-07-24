// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); 
const app = express();
const pgp = require('pg-promise')(); 
const bodyParser = require('body-parser');
const session = require('express-session'); 
const bcrypt = require('bcrypt'); 
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

// Added these two from my branch -Alexis
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

    res.redirect('/profile');

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
  // This is being replaced with a different system based on page loads
  // try {
  //   // Check if the user has an active session
  //   if (req.session.sessionId) {
  //     // Update the end_time of the existing session
  //     const endTime = moment().format();
  //     await db.none('UPDATE session SET end_time = $1 WHERE id = $2', [endTime, req.session.sessionId]);
  //   } else {
  //     // Insert a new session entry
  //     const startTime = moment().format();
  //     const result = await db.one('INSERT INTO session (player_id, start_time) VALUES ($1, $2) RETURNING id', [req.session.user.id, startTime]);
  //     req.session.sessionId = result.id; // Store the session ID in the session object
  //   }

  if(req.session){
    const session_id = parseInt(req.query.session_id)
    const bet = parseInt(req.query.betAmount);
    console.log("bet is:",bet);
    console.log(session_id);
    console.log(session_id + bet);

    res.render('pages/game',{
      user:req.session.user.username,
      contact:req.session.user.email,
      tokens:req.session.user.total_chips,
      bet:bet,
      session_id: session_id,
    }); 
  }
  // } catch (error) {
  //   console.log('Error:', error);
  else{
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

   const query = `SELECT * FROM session WHERE player_id = ${player_id} AND end_time IS NULL;`
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

/*------------
Table APIs above
------------*/



app.get('/profile', auth, (req, res) => {
  res.render('pages/profile',{
    user:req.session.user.username,
    contact:req.session.user.email,
    tokens:req.session.user.total_chips,
  }); 
});

app.get('/add500',auth, (req,res) => {
  const tok = req.query.tok;
  const uname = req.session.user.username;
  const query = `update player set total_chips = ${tok} where username= '${uname}';`;
  db.none(query)
  req.session.user.total_chips = tok ;
  res.redirect('/profile');

});

app.get('/update_tokens',auth,(req,res)=>{
  var tokenz = parseInt(req.query.tokenz);
  var bet = parseInt(req.query.bet);
  var page = parseInt(req.query.acchion);
  var session = parseInt(req.query.session_id);
  var sign = req.query.sign;
  if(sign==0){tokenz=tokenz-bet};
  if(sign==1){tokenz=tokenz+bet};
  const uname=req.session.user.username;
  const query=`update player set total_chips = ${tokenz} where username='${uname}'`;
  db.none(query)
  req.session.user.total_chips = tokenz;
  console.log("total:",tokenz,"bet:",bet,"math",sign,"page:",page);
  if(tokenz>500 && page==3){
    res.redirect('/bet?session=' + session);
  }
  else(res.redirect('/profile'))
});

app.get('/bet',auth,(req,res)=>{
  res.render('pages/bettingPage',{
    user:req.session.user.username,
    contact:req.session.user.email,
    tokens:req.session.user.total_chips,
    session: req.query.session
  });
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