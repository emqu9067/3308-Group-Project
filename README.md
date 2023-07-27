# 3308-Group-Project

PROJECT TEAM 3 - BlackJackers - Blackjack.Net

Members:
    Aiden Macdonald aima2745@colorado.edu aima2745 
    Emanuel Quintana emqu9067@colorado.edu emqu9067 
    Haoxuan Ding hadi8111@colorado.edu A-m-e-n-g 
    Alexis Cooper peco6819@colorado.edu AlexisCooper1
    Zach Jordan zajo2067@colorado.edu ZachJordan 

Application Description: Our blackjack website offers users an immersive and exciting online gaming experience where they can play the classic casino game of blackjack against an automated dealer. The application combines sleek design, smooth gameplay, and realistic graphics to create an engaging platform for both novice and experienced players. Our application follows all essential mechanics of a traditional blackjack game. Users receive their initial cards and make strategic decisions by hitting and standing, to maximize their chances of winning. The automated dealer follows standard blackjack rules—adding an element of challenge and unpredictability to each hand. Track you statistics over time to improve your win percentage, and ensure you're not being dealt bad hands by tracking your most common cards. By bringing the thrill of blackjack to the virtual world, our application offers users the convenience of playing their favorite game anytime and anywhere. Whether it's to unwind during a break, or sharpen their blackjack skills, our application provides hours of entertainment and a valuable opportunity for players to test their strategies and luck.

Technology Stack:
    Project Tracker – GitHub Project Board
    VCS – GitHub
    Database – PostgreSQL
    IDE – VSCode
    UI Tools – HTML/CSS, EJS
    Application Server – NodeJS
    Deployment Environment – Azure + Docker
    Communication – Discord + Zoom
    Additional Tools – DBDiagram.io + Lucidcharts

Prerequisites to Run App: Docker + PostgreSQL

How to Run Locally:
    1. Ensure Docker is Installed
    2. Download Main Branch from GitHub
    3. Navigate Working Directory to 'Code_Components'
    4. Set up .env File (See Bottom)
    5. Log into PostgreSQL Database
    6. Run Create.sql and Insert.sql Files
    7. Run CMD: docker-compose up

How to Run Tests: Testing not implemented

Deployment Link: blackjacknet.westus.azurecontainer.io/


---------------------- .env ----------------------
POSTGRES_HOST="YOUR_HOST"
POSTGRES_USER="YOUR_USERNAME"
POSTGRES_PASSWORD="YOUR_PASSWORD"
POSTGRES_DB="YOUR_DATABASE"
SESSION_SECRET="super duper secret!"
---------------------- .env ----------------------