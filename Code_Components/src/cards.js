class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
        // Getting card value
        this.value = this.getValue();
    }

    getValue() {
        if (this.rank > 10) return 10;
        else if (this.rank === 1) return 11;
        // Haven't done the part to let player choose between 1 and 11;
        else return this.rank;
    }

    isAce() {
        return this.rank === 1;
    }
}

class Deck {
    //assume we play two decks of card
    constructor(db, decksCount = 2) {
        this.cards = []; 
        this.db = db;
        this.fetchDeck(decksCount);
        this.shuffle();
    }

    fetchDeck(decksCount) {
        // Fetch the card ids from the database and store them in this.cards
        let query = `SELECT id FROM Card LIMIT ${decksCount * 52};`; 
        return this.db.any(query)
            .then(data => {
                // Map the returned data to an array of card ids
                this.cards = data.map(card => card.id);
            })
            .catch(err => {
                console.log('Error fetching cards from the database:', err);
            });
    }
    
    //Fisher-Yates shuffle
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1)); 

            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    draw(handId, dealerHand) {
        // Take a card id from the deck
        let cardId = this.cards.pop();

        // Update the Card record in the database to associate it with a hand
        let query = `UPDATE Card SET hand_id = ${handId}, dealer_hand = ${dealerHand} WHERE id = ${cardId};`;
        return this.db.none(query)
            .catch(err => {
                console.log('Error updating card in database:', err);
            });
    }
}

class Table {
    constructor(db) {
        this.db = db;
        this.deck = new Deck(db);
    }

    startSession(playerId) {
        // Insert a new session
        let query = `INSERT INTO Session (player_id, start_time) VALUES (${playerId}, NOW()) RETURNING id;`;
        return this.db.one(query)
            .then(data => {
                // Attach the session ID
                this.sessionId = data.id;
                return this.sessionId;
            })
            .catch(err => {
                console.log('Error starting a session:', err);
            });
    }

    startHand(betAmount) {
        // Insert a new hand
        let query = `INSERT INTO Hand (session_id, player_id, bet_amount) VALUES (${this.sessionId}, ${this.playerId}, ${betAmount}) RETURNING id;`;
        return this.db.one(query)
            .then(data => {
                // Attach the hand ID
                this.handId = data.id;
                return this.handId;
            })
            .catch(err => {
                console.log('Error starting a hand:', err);
            });
    }

    drawCard(dealerHand) {
        return this.deck.draw(this.handId, dealerHand);
    }
}
