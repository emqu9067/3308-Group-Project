var dealerSum = 0;
var playerSum = 0;
var dealerAces = 0;
var playerAces = 0;
var hiddenCard;
var deck;
var canHit = true;

let global_session_id;

window.onload = function() 
{
    // 1. Begin the session
    session = begin_session()
    // 3. Begin the game
    .then(function(session_id){
        console.log(session_id);
        global_session_id = session_id;
        begin_game();
    });
}

function begin_session()
{
    session = fetch('/table/begin_session', {
        method:'POST', 
        headers: {
            'Content-Type': 'application/json'
        }, 
        body: JSON.stringify({player_id: 1})
    })
    // 2. Get the session id
    session_id = new Promise((resolve, reject) => {
        get_session_id()
            .then(function(res) {
                resolve(res)
            })
            .catch(function(error) {
            console.log(error);
            })
      })

      return session_id;
}

function get_session_id()
{
    response = new Promise((resolve, reject) => {
        fetch('/table/get_current_session?player_id=1')
            .then(function(data)
            {
                return data.json();
            })
            .then(function(data) {
                //console.log(data.session_id);
                resolve(data.session_id);
            })
            .catch(function(err)
            {
                console.log(err);
                reject("Error");
            })
    })

    //console.log(response)

    return response;
}
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

function startHand()
{
    hiddenCard = deck.pop();
    dealerSum += getValue(hiddenCard);
    dealerAces += checkAce(hiddenCard);

    let cardImg = document.createElement("img");
    let card = deck.pop();
    cardImg.src = "/img/cards/" + card + ".svg";
    dealerSum += getValue(card);
    dealerAces += checkAce(card);
    document.getElementById("dealer-cards").append(cardImg);

    for (let i = 0; i < 2; i++)
    {
        let cardImg = document.createElement("img");
        let card = deck.pop();
        cardImg.src = "/img/cards/" + card + ".svg";
        playerSum += getValue(card);
        playerAces += checkAce(card);
        document.getElementById("player-cards").append(cardImg);
    }

    if (playerSum == 21 || dealerSum == 21) 
    {
        document.getElementById("hidden-card").src = "/img/cards/" + hiddenCard + ".svg";
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

    document.getElementById("hidden-card").src = "/img/cards/" + hiddenCard + ".svg";

    finishDealer();
    finishHand();
}

function finishDealer()
{
    while (dealerSum < 17)
    {
        let cardImg = document.createElement("img");
        let card = deck.pop();
        cardImg.src = "/img/cards/" + card + ".svg";
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
    if (playerSum > 21) message = "You Lose!";
    else if (dealerSum > 21) message = "You Win!";
    else if (playerSum == dealerSum) message = "It's A Tie!";
    else if (playerSum > dealerSum) message = "You Win!";
    else message = "You Lose!";

    document.getElementById("results").innerText = message;
    document.getElementById("dealer-sum").innerText = dealerSum;
    document.getElementById("player-sum").innerText = playerSum;
}

function hit()
{
    if (!canHit) return;
    
    let cardImg = document.createElement("img");
    let card = deck.pop();
    cardImg.src = "/img/cards/" + card + ".svg";
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