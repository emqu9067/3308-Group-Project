var dealerSum = 0;
var playerSum = 0;
var dealerAces = 0;
var playerAces = 0;
var hiddenCard;
var deck;
var canHit = true;
var canStay = true;
let global_session_id;

window.onload = function() 
{
        session = begin_session()
        .then(function(session_id)
        {
            global_session_id = session_id;
            begin_game();
        });
    }
    
async function begin_session()
{
    session = fetch('/table/begin_session', {method:'POST'})
    await session;

    session_id = new Promise((resolve, reject) => {
        get_session_id()
            .then(function(res) {
                resolve(res)
            })
            .catch(function(err) {
            console.log(err);
            reject(err)
            })
        })

    return session_id;
}

async function get_session_id()
{
    response = new Promise((resolve, reject) => {
        fetch('/table/get_current_session') 
            .then(function(data)
            {
                return data.json();
            })
            .then(function(data) {
                resolve(data.session_id);
            })
            .catch(function(err)
            {
                console.log(err);
                reject("Error");
            })
    })

    await response;

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
                bet_amount: 0, 
                is_winner: 0 
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

        fetch('/table/add_card_to_hand', {
            method:'POST', 
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify({
                hand_id: hand_id,
                suit: hiddenCard[2], 
                rank: hiddenCard[0], 
                dealer_hand: 1 
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

        fetch('/table/add_card_to_hand', {
            method:'POST', 
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify({
                hand_id: hand_id,
                suit: card[2], 
                rank: card[0], 
                dealer_hand: 1 
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
                suit: card[2], 
                rank: card[0], 
                dealer_hand: 0 
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
        canStay = false;
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
    if (!canStay) return;

    while (playerSum > 21 && playerAces > 0)
    {
        playerSum -= 10;
        playerAces -= 1;
    }
    
    canHit = false;
    canStay = false;

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
                suit: card[2], 
                rank: card[0], 
                dealer_hand: 1 
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
    if (playerSum > 21)
    {
        fetch('/table/update_loser', {
            method:'POST', 
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify({
                hand_id: hand_id
            })
        })
        message = "You Lose!";
    } 
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
    else
    {
        fetch('/table/update_loser', {
            method:'POST', 
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify({
                hand_id: hand_id
            })
        })
        message = "You Lose!";
    } 

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
            suit: card[2], 
            rank: card[0], 
            dealer_hand: 0 
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
        canStay = false;
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
    canStay = true;

    let cardImgHidden = document.getElementById("hidden-card");
    cardImgHidden.src = "../../resources/img/cards/BACK.svg";  
  
    document.getElementById("dealer-cards").innerHTML = "";
    document.getElementById("dealer-sum").innerHTML = "";
    document.getElementById("player-cards").innerHTML = "";
    document.getElementById("results").innerText = "";
    document.getElementById("play-again").style.display = "none";

    createDeck();
    shuffleDeck();
    startHand();
}