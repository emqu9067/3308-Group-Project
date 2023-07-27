addCards(); //Adds initial set of cards
setInterval(animateCards, 20000); // Set the interval for card animation in ms

function animateCards() { addCards(); }

function getRandomPosition(min, max) 
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleCards(array)
{
    for (let i = 0; i < array.length; i++) 
    {
       let j = Math.floor(Math.random() * array.length);
       let temp = array[i];
       array[i] = array[j];
       array[j] = temp;
    }
}

function removeCard(card) 
{
    card.addEventListener('animationend', function () 
    {
        // Check if the card's opacity has become 0 (animation is complete)
        if (window.getComputedStyle(card).getPropertyValue('opacity') === '0') 
        {
            const cardContainer = document.querySelector('.card-images');
            cardContainer.removeChild(card);
        }
    });
}

function addCards() 
{
    const loginBox = document.querySelector('.card');
    const cardContainer = document.querySelector('.card-images');
    const numCards = 50; //Controls the number of cards that appear

    const loginBoxRect = loginBox.getBoundingClientRect();
    const loginBoxCenterX = loginBoxRect.left + loginBoxRect.width / 2;
    const loginBoxCenterY = loginBoxRect.top + loginBoxRect.height / 2;
    const horizontalVariation = 1000; //Controls the horiztonal spread of cards 

    const totalArea = window.innerWidth * window.innerHeight;
    const cardArea = totalArea / numCards;
    const cardWidth = Math.sqrt(cardArea * 1.4);

    const cardNames = [];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];
    const suits = ['C', 'H', 'D', 'S'];
    for (const rank of ranks) for (const suit of suits) cardNames.push(`${rank}-${suit}.svg`); //Loop through and create all card names
    shuffleCards(cardNames); 

    for (let i = 0; i < numCards; i++) 
    {
        const card = document.createElement('img');
        card.src = `../../resources/img/cards/${cardNames[i % 52]}`;
        card.alt = cardNames[i % 52];
        card.classList.add('card-image');

        const startTime = getRandomPosition(0, 10000); // Delay in milliseconds (0 to 10 seconds)
        const horizontalOffset = getRandomPosition(-horizontalVariation, horizontalVariation); 
        card.style.animationDelay = `-${startTime}ms`;

        const posX = loginBoxCenterX + horizontalOffset;
        const posY = loginBoxCenterY;

        card.style.left = `${posX - cardWidth / 2}px`;
        card.style.top = `${posY - cardWidth / 2}px`;

        cardContainer.appendChild(card);
    }

    for (let i = 0; i < numCards; i++) removeCard(card);
}