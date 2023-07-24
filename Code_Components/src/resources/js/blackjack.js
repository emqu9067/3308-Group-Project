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
var global_session_id;

// On loading the window, this calls the begin_session function, which calls the get_session_id function (may be unnecessary, may fix)
window.onload = function() 
{
    console.log(document.getElementById("session").getAttribute("value"));
    session = parseInt(document.getElementById("session").getAttribute("value"));
    console.log(session);

    if(!session)
    {
        console.log("the");
        // Call the begin_session() function, which returns an integer.
        session = begin_session()
        // 3. Begin the game
        .then(function(session_id){
            // This console.log is for debugging. Sometimes it doesn't pass the session id??
            console.log(session_id);
            console.log(">>>")
            // Save it to the global session id variable
            global_session_id = session_id;
            
            // Now that this is done, start the game. 
            //This is within the .then() method because update_session() must activate after this.
            begin_game();
        });
    }
    else
    {
        console.log(session);
        global_session_id = session;
        begin_game();
    }
}
    
    // begin_session function. This is async because it needs to wait for the fetch() command within it
    // (.then() wasn't really working right, I couldn't quite figure out how to resolve things properly)
    async function begin_session()
    {
        console.log("beginning");
        // Call the begin_session endpoint, which does not return anything
        // (This may change later)
        session = fetch('/table/begin_session', {method:'POST'})
        // Wait for this above Promise to resolve.
        await session;
    
        console.log("doisahd");
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
    
          console.log("sadkl");
        // Return the (hopefully) resolved session_id
          return session_id;
    }
    
    // This function is also async for similar reasons.
    async function get_session_id()
    {
        // Set up a Promise which requests the get_curren_session endpoint
        response = new Promise((resolve, reject) => {
            fetch('/table/get_current_session') // Change this when the login thing is working
                // This returns a Promise, so you have to have this here to convert it to a JSON.
                .then(function(data)
                {
                    return data.json();
                })
                // Then resolve the Promise with the proper session id
                .then(function(data) {
                    document.getElementById("session").setAttribute("value", data.session_id);
                    document.getElementById("session_id").setAttribute("value", data.session_id);
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
        //console.log(response);

        // Add that to the HTML
        //document.getElementById("session").setAttribute("value", response);
        //document.getElementById("session_id").setAttribute("value", response);
    
        // Return the (hopefully) resolved session id.
        return response;
    }
    
// Async because the begin_session stuff has to activate first.
async function begin_game()
{
    console.log("adsds")
    await global_session_id; 
    update_session(global_session_id);

    createDeck();
    shuffleDeck();
    startHand();
}

function createDeck() 
{
    console.log("creating");
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

function startHand()
{
    hiddenCard = deck.pop();
    dealerSum += getValue(hiddenCard);
    dealerAces += checkAce(hiddenCard);

    let cardImg = document.createElement("img");
    let card = deck.pop();
    cardImg.src = "../../resources/img/cards/" + card + ".svg";
    dealerSum += getValue(card);
    dealerAces += checkAce(card);
    document.getElementById("dealer-cards").append(cardImg);

    for (let i = 0; i < 2; i++)
    {
        let cardImg = document.createElement("img");
        let card = deck.pop();
        cardImg.src = "../../resources/img/cards/" + card + ".svg";
        playerSum += getValue(card);
        playerAces += checkAce(card);
        document.getElementById("player-cards").append(cardImg);
    }

    if (playerSum == 21 || dealerSum == 21) 
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

function stay()
{
    while (playerSum > 21 && playerAces > 0)
    {
        playerSum -= 10;
        playerAces -= 1;
    }
    
    canHit = false;

    document.getElementById("hidden-card").src = "../../resources/img/cards/" + hiddenCard + ".svg";

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
    var valu;
    if (playerSum > 21) {message = "You Lose!"; valu=0;}
    else if (dealerSum > 21) {message = "You Win!"; valu=1;}
    else if (playerSum == dealerSum) {message = "It's A Tie!"; valu=2;}
    else if (playerSum > dealerSum) {message = "You Win!"; valu=1;}
    else { message = "You Lose!"; valu=0; }


    document.getElementById("results").innerText = message;
    document.getElementById("dealer-sum").innerText = dealerSum;
    document.getElementById("player-sum").innerText = playerSum;
    document.getElementById("eResult").value = valu ;
    document.getElementById("fResult").style.display="block";

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

    while (playerSum > 21 && playerAces > 0)
    {
        playerSum -= 10;
        playerAces -= 1;
    }

    document.getElementById("player-sum").innerText = playerSum;

    if (playerSum > 21) canHit = false;
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
