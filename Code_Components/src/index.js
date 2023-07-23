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

app.get('/table', auth, (req, res) => {
  const bet = parseInt(req.query.betAmount);
  console.log("bet is:",bet);
  res.render('pages/game',{
    user:req.session.user.username,
    contact:req.session.user.email,
    tokens:req.session.user.total_chips,
    bet:bet,
  }); 
});

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
  var sign = req.query.sign;
  if(sign==0){tokenz=tokenz-bet};
  if(sign==1){tokenz=tokenz+bet};
  const uname=req.session.user.username;
  const query=`update player set total_chips = ${tokenz} where username='${uname}'`;
  db.none(query)
  req.session.user.total_chips = tokenz;
  console.log("total:",tokenz,"bet:",bet,"math",sign,"page:",page);
  if(tokenz>500 && page==3){
    res.redirect('/bet');
  }
  else(res.redirect('/profile'))
});

app.get('/bet',auth,(req,res)=>{
  res.render('pages/bettingPage',{
    user:req.session.user.username,
    contact:req.session.user.email,
    tokens:req.session.user.total_chips,
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