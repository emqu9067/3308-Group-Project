var dealerSum = 0;
var playerSum = 0;
var dealerAces = 0;
var playerAces = 0;
var hiddenCard;
var deck;
var canHit = true;

window.onload = function() 
{
    createDeck();
    shuffleDeck();
    startHand();
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