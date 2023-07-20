DROP TABLE IF EXISTS player CASCADE;
CREATE TABLE IF NOT EXISTS player (
  id SERIAL PRIMARY KEY NOT NULL,
  username VARCHAR(100) UNIQUE,
  password VARCHAR(100) NOT NULL,
  email VARCHAR(200) UNIQUE,
  total_chips INT
);

DROP TABLE IF EXISTS session CASCADE;
CREATE TABLE IF NOT EXISTS session (
  id SERIAL PRIMARY KEY NOT NULL,
  player_id INT NOT NULL,
  start_time TIMESTAMP,
  end_time TIMESTAMP
);

DROP TABLE IF EXISTS hand CASCADE;
CREATE TABLE IF NOT EXISTS hand (
  id SERIAL PRIMARY KEY NOT NULL,
  session_id INT NOT NULL,
  player_id INT NOT NULL,
  bet_amount INT,
  is_winner SMALLINT
);

DROP TABLE IF EXISTS card CASCADE;
CREATE TABLE IF NOT EXISTS card (
  id SERIAL PRIMARY KEY NOT NULL,
  hand_id INT NOT NULL,
  suit VARCHAR(1),
  rank VARCHAR(1),
  dealer_hand SMALLINT
);
