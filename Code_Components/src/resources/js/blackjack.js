var dealerSum = 0;
var playerSum = 0;
var dealerAces = 0;
var playerAces = 0;
var hiddenCard;
var deck;
var canHit = true;

// Documenting everything I've done today (7/16) because it's a real clusterfuck and I know I won't remember how it works if I don't do this now

// Global variable so we don't have to fuck around with parameters for every function or whatever
// (Now that I think about it the way I've implemented it we wouldn't need that but w h a t e v e r)
let global_session_id;

// On loading the window, this calls the begin_session function, which calls the get_session_id function (may be unnecessary, may fix)
window.onload = function() 
{
        // Call the begin_session() function, which returns an integer.
        session = begin_session()
        // 3. Begin the game
        .then(function(session_id){
            // This console.log is for debugging. Sometimes it doesn't pass the session id??
            console.log(session_id);
            // Save it to the global session id variable
            global_session_id = session_id;
            
            // Now that this is done, start the game. 
            //This is within the .then() method because update_session() must activate after this.
            begin_game();
        });
    }
    
    // begin_session function. This is async because it needs to wait for the fetch() command within it
    // (.then() wasn't really working right, I couldn't quite figure out how to resolve things properly)
    async function begin_session()
    {
        // Call the begin_session endpoint, which does not return anything
        // (This may change later)
        session = fetch('/table/begin_session', {
            method:'POST', 
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify({player_id: 1})
        })
        // Wait for this above Promise to resolve.
        await session;
    
        // Now set up session_id as a Promise, which will call the get_session_id() function
        session_id = new Promise((resolve, reject) => {
            get_session_id()
                // If get_session_id returns a valid number, then resolve the session_id Promise as that
                .then(function(res) {
                    resolve(res)
                })
                // Otherwise, set it as the error
                .catch(function(err) {
                console.log(err);
                reject(err)
                })
          })
    
        // Return the (hopefully) resolved session_id
          return session_id;
    }
    
    // This function is also async for similar reasons.
    async function get_session_id()
    {
        // Set up a Promise which requests the get_curren_session endpoint
        response = new Promise((resolve, reject) => {
            fetch('/table/get_current_session?player_id=1') // Change this when the login thing is working
                // This returns a Promise, so you have to have this here to convert it to a JSON.
                .then(function(data)
                {
                    return data.json();
                })
                // Then resolve the Promise with the proper session id
                .then(function(data) {
                    resolve(data.session_id);
                })
                // Otherwise, set reject the Promise as the error
                .catch(function(err)
                {
                    console.log(err);
                    reject("Error");
                })
        })
    
        // Wait for the above Promise to resolve
        await response;
    
        // Return the (hopefully) resolved session id.
        return response;
    }
    
    // Async because the begin_session stuff has to activate first.
    async function begin_game()
    {
        await global_session_id; 
        update_session(global_session_id);
    
    createDeck();
    shuffleDeck();
    startHand();
}

function update_session()
{
    // console.log(session_id)
    fetch('/table/update_session', {
        method:'POST', 
        headers: {
            'Content-Type': 'application/json'
        }, 
        body: JSON.stringify({session_id: global_session_id})
    })
}

function createDeck() 
{
    let suits = ["C", "D", "H", "S"];
    let ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"];
    deck = [];

    for (let i = 0; i < suits.length; i++) 
    {
        for (let j = 0; j < ranks.length; j++) 
        {
            deck.push(ranks[j] + "-" + suits[i]);
        }
    }
}

function shuffleDeck()
{
    for (let i = 0; i < deck.length; i++) 
    {
       let j = Math.floor(Math.random() * deck.length);
       let temp = deck[i];
       deck[i] = deck[j];
       deck[j] = temp;
    }
}

async function startHand()
{    
    hand_id = await new Promise((resolve, reject) => {
        fetch('/table/add_hand', {
            method:'POST', 
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify({
                session_id: global_session_id,
                player_id: 1, // Update this later when login is done
                bet_amount: 0, // Update this later too
                is_winner: 0 // Add update_card endpoint when hand is done
            })
        })
        .then(function(data)
        {
            return data.json()
        })
        .then(function(data)
        {
            console.log(data);
            resolve(data.hand_id);
        })
    });

    console.log(hand_id)

    hiddenCard = deck.pop();
    dealerSum += getValue(hiddenCard);
    dealerAces += checkAce(hiddenCard);

        // Add the dealer's hidden card to the hand
        fetch('/table/add_card_to_hand', {
            method:'POST', 
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify({
                hand_id: hand_id,
                suit: hiddenCard[2], // Update this later when login is done
                rank: hiddenCard[0], // Update this later too
                dealer_hand: 1 // Add update_card endpoint when hand is done
            })
        })
    

    let cardImgHidden = document.createElement("img");
    cardImgHidden.id = "hidden-card";
    cardImgHidden.src = "../../resources/img/cards/BACK.svg"; 

    let dealerCards = document.getElementById("dealer-cards");
    dealerCards.innerHTML = ""; 

    let cardImg = document.createElement("img");
    let card = deck.pop();
    cardImg.src = "../../resources/img/cards/" + card + ".svg";
    dealerSum += getValue(card);
    dealerAces += checkAce(card);
    dealerCards.append(cardImgHidden);
    dealerCards.append(cardImg);
        // Add the dealer's visible card to the hand
        fetch('/table/add_card_to_hand', {
            method:'POST', 
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify({
                hand_id: hand_id,
                suit: card[2], // Update this later when login is done
                rank: card[0], // Update this later too
                dealer_hand: 1 // Add update_card endpoint when hand is done
            })
        })

    let playerCards = document.getElementById("player-cards");
    playerCards.innerHTML = ""; 

    for (let i = 0; i < 2; i++)
    {
        let cardImg = document.createElement("img");
        let card = deck.pop();
        cardImg.src = "../../resources/img/cards/" + card + ".svg";
        playerSum += getValue(card);
        playerAces += checkAce(card);
        document.getElementById("player-cards").append(cardImg);
        
        fetch('/table/add_card_to_hand', {
            method:'POST', 
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify({
                hand_id: hand_id,
                suit: card[2], // Update this later when login is done
                rank: card[0], // Update this later too
                dealer_hand: 0 // Add update_card endpoint when hand is done
            })
        })
    }

    while (playerSum > 21 && playerAces > 0)
    {
        playerSum -= 10;
        playerAces -= 1;
    }

    if (playerSum >= 21 || dealerSum >= 21) 
    {
        document.getElementById("hidden-card").src = "../../resources/img/cards/" + hiddenCard + ".svg";
        canHit = false;
        finishHand();
    }
    else
    {
        document.getElementById("player-sum").innerText = playerSum;
        document.getElementById("hit").addEventListener("click", hit);
        document.getElementById("stay").addEventListener("click", stay);
    }
}

function stay()
{
    while (playerSum > 21 && playerAces > 0)
    {
        playerSum -= 10;
        playerAces -= 1;
    }
    
    canHit = false;

    document.getElementById("hidden-card").src = "../../resources/img/cards/" + hiddenCard + ".svg";

    let cardImgHidden = document.getElementById("hidden-card");
    cardImgHidden.src = "../../resources/img/cards/" + hiddenCard + ".svg";
   
    finishDealer();
    finishHand();
}

function finishDealer()
{
    while (dealerSum < 17)
    {
        let cardImg = document.createElement("img");
        let card = deck.pop();
        cardImg.src = "../../resources/img/cards/" + card + ".svg";
        dealerSum += getValue(card);
        dealerAces += checkAce(card);
        document.getElementById("dealer-cards").append(cardImg);

        fetch('/table/add_card_to_hand', {
            method:'POST', 
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify({
                hand_id: hand_id,
                suit: card[2], // Update this later when login is done
                rank: card[0], // Update this later too
                dealer_hand: 1 // Add update_card endpoint when hand is done
            })
        })
        
        while (dealerSum > 21 && dealerAces > 0)
        {
            dealerSum -= 10;
            dealerAces -= 1;
        }
    }   
}

function finishHand()
{
    let message = "";
    if (playerSum > 21) message = "You Lose!";
    else if (dealerSum > 21)
    {
        fetch('/table/update_winner', {
            method:'POST', 
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify({
                hand_id: hand_id
            })
        })
        message = "You Win!";
    }



    else if (playerSum == dealerSum) message = "It's A Tie!";
    else if (playerSum > dealerSum)
    {
        fetch('/table/update_winner', {
            method:'POST', 
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify({
                hand_id: hand_id
            })
        })
        
        message = "You Win!";
    }
    else message = "You Lose!";

    document.getElementById("results").innerText = message;
    document.getElementById("dealer-sum").innerText = dealerSum;
    document.getElementById("player-sum").innerText = playerSum;

    document.getElementById("play-again").style.display = "block";
}

function hit()
{
    if (!canHit) return;
    
    let cardImg = document.createElement("img");
    let card = deck.pop();
    cardImg.src = "../../resources/img/cards/" + card + ".svg";
    playerSum += getValue(card);
    playerAces += checkAce(card);
    document.getElementById("player-cards").append(cardImg);

    fetch('/table/add_card_to_hand', {
        method:'POST', 
        headers: {
            'Content-Type': 'application/json'
        }, 
        body: JSON.stringify({
            hand_id: hand_id,
            suit: card[2], // Update this later when login is done
            rank: card[0], // Update this later too
            dealer_hand: 0 // Add update_card endpoint when hand is done
        })
    })

    while (playerSum > 21 && playerAces > 0)
    {
        playerSum -= 10;
        playerAces -= 1;
    }

    document.getElementById("player-sum").innerText = playerSum;

    if (playerSum > 21)
    {
        canHit = false;
        document.getElementById("hidden-card").src = "../../resources/img/cards/" + hiddenCard + ".svg";
        finishHand();
    } 
}

function getValue(card)
{
    let data = card.split("-");
    let rank = data[0];

    if (isNaN(rank))
    {
        if (rank == "A") return 11;
        return 10;
    }

    return parseInt(rank)
}

function checkAce(card)
{
    if (card[0] == "A") return 1;
    return 0;
}

function playAgain() 
{
    dealerSum = 0;
    playerSum = 0;
    dealerAces = 0;
    playerAces = 0;
    hiddenCard = null;
    deck = [];
    canHit = true;
  
    let cardImgHidden = document.getElementById("hidden-card");
    cardImgHidden.src = "../../resources/img/cards/BACK.svg";  
  
    resetElements();
  
    createDeck();
    shuffleDeck();
    startHand();
}

function resetElements() 
{
    document.getElementById("dealer-cards").innerHTML = "";
    document.getElementById("player-cards").innerHTML = "";
    document.getElementById("results").innerText = "";
    document.getElementById("play-again").style.display = "none";
}