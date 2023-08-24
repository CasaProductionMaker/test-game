//import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
const firebaseConfig = {
  apiKey: "AIzaSyDBKwQRTu3xsHZjuzW3TFZFdHlGwbhttqY",
  authDomain: "test-game-eba29.firebaseapp.com",
  databaseURL: "https://test-game-eba29-default-rtdb.firebaseio.com",
  projectId: "test-game-eba29",
  storageBucket: "test-game-eba29.appspot.com",
  messagingSenderId: "118728291028",
  appId: "1:118728291028:web:3f0a0dc3ee48dbcb304141"
};
// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

//My code
let myLocation = "Lobby";
let myDurability = 0;

const lobbyMapData = {
  minX: 1,
  maxX: 14,
  minY: 3,
  maxY: 12,
  blockedSpaces: {
    "7x4": true,
    "1x11": true,
    "12x10": true,
    "7x9": true,
    "9x9": true,
    "1x3": true,
    "2x3": true,
    "4x3": true,
    "5x3": true,
    "6x3": true,
    "7x3": true,
    "8x3": true,
    "9x3": true,
    "10x3": true,
    "11x3": true,
    "12x3": true,
    "13x3": true,
    "7x7": true
  }, 
  portals: {
    "8x9": "Graveyard", 
    "3x3": "Shop"
  }, 
  portalBlocked: {
    "8x9": true, 
    "3x3": true
  }
};
const shopMapData = {
  minX: 2,
  maxX: 13,
  minY: 2,
  maxY: 12,
  blockedSpaces: {
    "2x11": true, 
    "3x11": true, 
    "4x11": true, 
    "5x11": true, 
    "6x11": true, 
    "8x11": true, 
    "9x11": true, 
    "10x11": true, 
    "11x11": true, 
    "12x11": true, 
    "2x7": true, 
    "2x8": true, 
    "3x5": true, 
    "3x6": true, 
    "4x8": true, 
    "4x9": true, 
    "10x7": true, 
    "10x8": true, 
    "12x6": true, 
    "12x7": true, 
    "4x2": true, 
    "4x3": true, 
    "5x3": true, 
    "6x3": true, 
    "7x3": true, 
    "8x3": true, 
    "8x2": true,  
    "10x4": true, 
    "11x4": true
  }, 
  portals: {
    "7x11": "Lobby"
  }, 
  portalBlocked: {
    "7x11": true
  }
  //shopkeeper at 6x3
};

const playerColors = ["blue", "red", "orange", "yellow", "green", "purple"];

function randomFromArray(array) {
	return array[Math.floor(Math.random() * array.length)];
}
function getKeyString(x, y) {
	return `${x}x${y}`;
}
function createName() {
  const prefix = randomFromArray([
    "COOL",
    "SUPER",
    "HIP",
    "SMUG",
    "SILKY",
    "GOOD",
    "SAFE",
    "DEAR",
    "DAMP",
    "WARM",
    "RICH",
    "LONG",
    "DARK",
    "SOFT",
    "BUFF",
    "DOPE",
    "UNCOOL",
    "GODLY",
    "OP",
    "POOR",
    "THE",
  ]);
  const animal = randomFromArray([
    "BEAR",
    "DOG",
    "CAT",
    "FOX",
    "LAMB",
    "LION",
    "BOAR",
    "GOAT",
    "VOLE",
    "SEAL",
    "PUMA",
    "MULE",
    "BULL",
    "BIRD",
    "BUG",
    "MONKEY",
    "DRAGON",
    "ANT",
    "SNAKE",
  ]);
  return `${prefix} ${animal}`;
}
function getCurrentMapData() {
  let mapData;
  if(myLocation == "Lobby")
  {
    mapData = lobbyMapData;
  }
  if(myLocation == "Shop")
  {
    mapData = shopMapData;
  }
  return mapData;
}
function isSolid(x, y) {
  const mapData = getCurrentMapData();
  const blockedNextSpace = mapData.blockedSpaces[getKeyString(x, y)];
  return (
    blockedNextSpace || 
    x >= mapData.maxX || 
    x < mapData.minX || 
    y >= mapData.maxY || 
    y < mapData.minY
  )
}
function isPortal(x, y) {
  const mapData = getCurrentMapData();
  const blockedNextSpace = mapData.portalBlocked[getKeyString(x, y)];
  return (
    blockedNextSpace || 
    x >= mapData.maxX || 
    x < mapData.minX || 
    y >= mapData.maxY || 
    y < mapData.minY
  )
}
function getRandomSafeSpot() {
  let x = Math.floor(Math.random() * 13);
  let y = Math.floor(Math.random() * 11);
  while(isSolid(x, y) || isPortal(x, y))
  {
    x = Math.floor(Math.random() * 13);
    y = Math.floor(Math.random() * 11);
  }
  return {x, y};
}

(function() {

	let playerId;
	let playerRef;
  let players = {};
  let playerElements = {};
  let coins = {};
  let coinElements = {};
  let potions = {};
  let potionElements = {};
  let items = {};
  let itemElements = {};
  let isButton = false;
  let chatMsg = 0;

  const gameContainer = document.querySelector(".game-container");
  const respawnContainer = document.querySelector(".respawn-container");
  const playerNameInput = document.querySelector("#player-name");
  const playerColorButton = document.querySelector("#player-color");
  const chatSend = document.querySelector("#send-chat");
  const chatInput = document.querySelector("#chat-input");
  const chatDisplay = document.querySelector("#chat-display");
  const dialogueDisplay = document.querySelector(".dialogue-container");
  const durDisplay = document.querySelector(".player-dur-info");

  gameContainer.setAttribute("data-map", "Lobby");

  function repairTool() {
    if(players[playerId].coins > 20)
    {
      myDurability = 50;
      durDisplay.innerText = "Current Durability: " + myDurability;
      firebase.database().ref("players/" + playerId).update({
        coins: players[playerId].coins - 20
      });
    }
  }
  function placeCoin() {
    var x = getRandomSafeSpot().x;
    var y = getRandomSafeSpot().y;

    if(players[playerId] != null) {
      x = players[playerId].x;
      y = players[playerId].y;
      if(players[playerId].potionDuration > 0) {
        if(!isSolid(x, y + 1)) {
          y += 1;
        } else if(!isSolid(x, y - 1)) {
          y -= 1;
        } else if(!isSolid(x + 1, y)) {
          x += 1;
        } else if(!isSolid(x + 1, y)) {
          x -= 1;
        }
        if(isSolid(x, y)) {
          x = players[playerId].x;
          y = players[playerId].y;
        }
      } else {
        x = getRandomSafeSpot().x;
        y = getRandomSafeSpot().y;
      }
    }
    if(isSolid(x, y)) {
      x = getRandomSafeSpot().x;
      y = getRandomSafeSpot().y;
    }

    if(isSolid(x, y)) {
      x = getRandomSafeSpot().x;
      y = getRandomSafeSpot().y;
    }

    if(isSolid(x, y)) {
      x = getRandomSafeSpot().x;
      y = getRandomSafeSpot().y;
    }
    console.log(isSolid(x, y));
    if(myLocation == "Lobby")
    {
      const coinRef = firebase.database().ref(`coins/${getKeyString(x, y)}`);
      coinRef.set({
        x, 
        y, 
        location: myLocation
      })
    }

    const coinTimeouts = [4000, 5000, 6000, 7000];
    setTimeout(() => {
      placeCoin();
    }, randomFromArray(coinTimeouts));
  }
  function placeItem(itemType) {
    var x = getRandomSafeSpot().x;
    var y = getRandomSafeSpot().y;
    if(isSolid(x, y)) {
      x = getRandomSafeSpot().x;
      y = getRandomSafeSpot().y;
    }

    if(isSolid(x, y)) {
      x = getRandomSafeSpot().x;
      y = getRandomSafeSpot().y;
    }

    if(isSolid(x, y)) {
      x = getRandomSafeSpot().x;
      y = getRandomSafeSpot().y;
    }

    const itemRef = firebase.database().ref(`items/${getKeyString(x, y)}`);
    itemRef.set({
      x, 
      y, 
      type: itemType
    })

    const itemTimeouts = [40000, 50000, 60000, 70000];
    setTimeout(() => {
      placeItem(itemType);
    }, randomFromArray(itemTimeouts));
  }
  function oneSecondLoop() {
    if(players[playerId] != null) {
      if(players[playerId].potionDuration > 0) {
        playerRef.update({
          potionDuration: players[playerId].potionDuration - 1,
        })
      }
      if(players[playerId].isDead > 0 && !isButton) {
        const buttonElement = document.createElement("div");
        buttonElement.classList.add("respawnButton");
        buttonElement.innerHTML = (`
          <button id="respawn">Respawn</button>
        `)
        const respawnButton = buttonElement.querySelector("#respawn");
        respawnButton.addEventListener("click", () => {
          isButton = false;
          myLocation = "Lobby";
          gameContainer.setAttribute("data-map", myLocation);
          respawnContainer.querySelector(".respawnButton").remove();
          const {x, y} = getRandomSafeSpot();
          playerRef.update({
            isDead: false, 
            coins: 0, 
            health: 5, 
            x, 
            y, 
            location: "Lobby"
          })
        })
        respawnContainer.appendChild(buttonElement);
        isButton = true;
      }
    }

    //repeat
    setTimeout(() => {
      oneSecondLoop();
    }, 1000);
  }
  function tickLoop() {
    if(players[playerId] != null) {
      if(players[playerId].health <= 0) {
        playerRef.update({
          isDead: true
        })
      }
      playerRef.update({
        location: myLocation
      })
    }

    let i = 0;
    for (let x in coinElements)
    {
      coinElements[x].querySelector(".Coin_sprite").setAttribute("data-location", coins[x].location == myLocation ? "some" : "none");
      coinElements[x].querySelector(".Coin_shadow").setAttribute("data-location", coins[x].location == myLocation ? "some" : "none");
      i++;
    }

    //repeat
    setTimeout(() => {
      tickLoop();
    }, 1);
  }
  function attemptGrabCoin(x, y) {
    const key = getKeyString(x, y);
    if (coins[key]) {
      if(coins[key].location == myLocation)
      {
        // Remove this key from data, then uptick Player's coin count
        firebase.database().ref(`coins/${key}`).remove();
        playerRef.update({
          coins: players[playerId].coins + 1,
        })
        if(players[playerId].coins === 50) {
          placePotion();
        }
        if(players[playerId].coins === 70) {
          placeItem("sword");
        }
        if(players[playerId].coins === 90) {
          placeItem("axe");
        }
      }
    }
  }
  function placePotion() {
    const {x, y} = getRandomSafeSpot();
    const potionRef = firebase.database().ref(`potions/${getKeyString(x, y)}`);
    potionRef.set({
      x, 
      y
    })

    const potionTimeouts = [40000, 50000, 60000, 30000];
    setTimeout(() => {
      placePotion();
    }, randomFromArray(potionTimeouts));
  }
  function attemptDrinkPotion(x, y) {
    const key = getKeyString(x, y);
    if (potions[key]) {
      // Remove this key from data, then uptick Player's coin count
      firebase.database().ref(`potions/${key}`).remove();
      playerRef.update({
        potionDuration: players[playerId].potionDuration + 20,
      })
    }
  }
  function attemptGrabItem(x, y) {
    const key = getKeyString(x, y);
    if (items[key]) {
      // Remove this key from data, then uptick Player's coin count
      playerRef.update({
        weapon: items[key].type
      })
      myDurability = items[key].type == "sword" ? 50 : 70;
      durDisplay.innerText = "Current Durability: " + myDurability;
      firebase.database().ref(`items/${key}`).remove();
    }
  }
  function handleArrowPress(xChange=0, yChange=0) {
    const newX = players[playerId].x + xChange;
    const newY = players[playerId].y + yChange;
    const oldX = players[playerId].x;
    const oldY = players[playerId].y;
    if (!isSolid(newX, newY) && !players[playerId].isDead) {
      //move to the next space
      players[playerId].x = newX;
      players[playerId].y = newY;
      if (xChange === 1) {
        players[playerId].direction = "right";
      }
      if (xChange === -1) {
        players[playerId].direction = "left";
      }
      playerRef.set(players[playerId]);
      attemptGrabCoin(newX, newY);
      attemptDrinkPotion(newX, newY);
      attemptGrabItem(newX, newY);
      const mapData = getCurrentMapData();
      if(mapData.portals[getKeyString(newX, newY)])
      {
        const portalToEnter = mapData.portals[getKeyString(newX, newY)];
        if(portalToEnter == "Shop")
        {
          players[playerId].x = 7;
          players[playerId].y = 11;
        }
        if(portalToEnter == "Lobby" && myLocation == "Shop")
        {
          players[playerId].x = 3;
          players[playerId].y = 3;
        }
        myLocation = portalToEnter;
        gameContainer.setAttribute("data-map", myLocation);
      }
      if(myLocation == "Shop" && getKeyString(newX, newY) == "6x4")
      {
        //Talk to shopkeeper
        if(myDurability < 10 && myDurability != 0)
        {
          OpenDialogue(
            "Hello there, I am the shopkeeper.", 
            "Ok", 
            null, 
            "dialogue", 
            null, 
            () => OpenDialogue(
              "I have a great deal for you.", 
              "What is it?", 
              "No thanks, Bye.", 
              "dialogue", 
              "dialogue", 
              () => OpenDialogue(
                "I see your weapon there is about to break. I can repair that for you. It'll cost you 20 coins", 
                "Ok, sure", 
                "Nope", 
                "dialogue", 
                "dialogue", 
                () => repairTool(), 
                () => CloseDialogue()
              ), 
              () => CloseDialogue()
            ), 
            null
          );
        } else {
          OpenDialogue(
            "Hello there, I am the shopkeeper.", 
            "Ok", 
            null, 
            "dialogue", 
            null, 
            () => OpenDialogue(
              "Are you gonna buy something or are you just wasting my time?!", 
              "I'll buy something", 
              "Just wasting your time.", 
              "dialogue", 
              "dialogue", 
              () => OpenDialogue(
                "I can sell this sword for 40 coins", 
                "Buy", 
                null, 
                "item", 
                null, 
                {
                  "item": "sword", 
                  "price": 40
                }, 
                null
              ), 
              () => CloseDialogue()
            ), 
            null
          );
        }
      }
      if(myLocation == "Shop" && getKeyString(oldX, oldY) == "6x4")
      {
        //End talk to shopkeeper
        CloseDialogue();
      }
      playerRef.set(players[playerId]);
    }
  }
  function handleAttack() {
    var attackX;
    myDurability--;
        if(myDurability < 0)
        {
          myDurability = 0;
          firebase.database().ref("players/" + playerId).update({
            weapon: "none"
          })
        }
    if(players[playerId].direction === "right") {
      //right
      attackX = players[playerId].x + 1;
      let playerToAttack;
      Object.keys(players).forEach((key) => {
        const characterState = players[key];
        if(characterState.x === attackX && characterState.y === players[playerId].y)
        {
          playerToAttack = key;
        }
      })
      if(playerToAttack != null && !players[playerId].isDead && !players[playerToAttack].isDead) {
        myDurability--;
        if(myDurability < 0)
        {
          myDurability = 0;
          firebase.database().ref("players/" + playerId).update({
            weapon: "none"
          })
        }
        playerToAttackRef = firebase.database().ref("players/" + playerToAttack);
        var damage = randomFromArray([0, 0, 0, 0, 0, 0, 0, 1, 1, 1]);
        if(players[playerId].weapon == "sword")
        {
          damage = randomFromArray([0, 0, 1, 1, 1, 1, 1, 1, 1, 1]);
        }
        if(players[playerId].weapon == "axe")
        {
          damage = randomFromArray([1, 1, 1, 1, 1, 1, 1, 1, 1, 2]);
        }
        if(players[playerId].location == players[playerToAttack].location)
        {
          playerToAttackRef.update({
            health: players[playerToAttack].health - damage
          })
        }
        if(players[playerToAttack].health - damage <= -1) {
          playerRef.update({
            coins: players[playerId].coins + players[playerToAttack].coins
          })
          if(players[playerToAttack].weapon != "none")
          {
            playerRef.update({
              weapon: players[playerToAttack].weapon
            })
            myDurability = players[playerToAttack].weapon == "sword" ? 50 : 70
          }
          playerToAttackRef.update({
            coins: 0, 
            weapon: "none"
          })
        }
      }
    } else {
      //left
      attackX = players[playerId].x - 1;
      let playerToAttack;
      Object.keys(players).forEach((key) => {
        const characterState = players[key];
        if(characterState.x === attackX && characterState.y === players[playerId].y)
        {
          playerToAttack = key;
        }
      })
      if(playerToAttack != null && !players[playerId].isDead && !players[playerToAttack].isDead) {
        myDurability--;
        if(myDurability < 0)
        {
          myDurability = 0;
          firebase.database().ref("players/" + playerId).update({
            weapon: "none"
          })
        }
        playerToAttackRef = firebase.database().ref("players/" + playerToAttack);
        var damage = randomFromArray([0, 0, 0, 0, 0, 0, 0, 1, 1, 1]);
        if(players[playerId].weapon == "sword")
        {
          damage = randomFromArray([0, 0, 1, 1, 1, 1, 1, 1, 1, 1]);
        }
        if(players[playerId].weapon == "axe")
        {
          damage = randomFromArray([1, 1, 1, 1, 1, 1, 1, 1, 1, 2]);
        }
        if(players[playerId].location == players[playerToAttack].location)
        {
          playerToAttackRef.update({
            health: players[playerToAttack].health - damage
          })
        }
        if(players[playerToAttack].health - damage <= -1) {
          playerRef.update({
            coins: players[playerId].coins + players[playerToAttack].coins
          })
          if(players[playerToAttack].weapon != "none")
          {
            playerRef.update({
              weapon: players[playerToAttack].weapon
            })
            myDurability = players[playerToAttack].weapon == "sword" ? 50 : 70
          }
          playerToAttackRef.update({
            coins: 0, 
            weapon: "none"
          })
        }
      }
    }
    durDisplay.innerText = "Current Durability: " + myDurability;
  }
  function OpenDialogue(message, buttonone, buttontwo, b1func, b2func, b1fdata, b2fdata) {
    //open a dialogue
    let number = 2;
    dialogueDisplay.querySelector("#dialogue-text").innerText = message;
    dialogueDisplay.querySelector("#first-button").innerText = buttonone;
    dialogueDisplay.querySelector("#second-button").innerText = buttontwo;
    dialogueDisplay.querySelector("#first-button").setAttribute("data-show", "true");
    dialogueDisplay.querySelector("#second-button").setAttribute("data-show", "true");
    if(buttonone == null)
    {
      dialogueDisplay.querySelector("#first-button").setAttribute("data-show", "false");
      dialogueDisplay.querySelector("#second-button").setAttribute("data-show", "false");
      number = 0;
    } else if(buttontwo == null)
    {
      dialogueDisplay.querySelector("#second-button").setAttribute("data-show", "false");
      number = 1;
    }
    dialogueDisplay.querySelector("#exit-button").setAttribute("data-show", "true");
    dialogueDisplay.setAttribute("data-show", "true");
    dialogueDisplay.querySelector("#exit-button").addEventListener("click", () => {
      CloseDialogue();
    })
    if(b1func == "item")
    {
      dialogueDisplay.querySelector("#first-button").addEventListener("click", () => {
        if(players[playerId].coins >= b1fdata.price)
        {
          playerRef.update({
            coins: players[playerId].coins - b1fdata.price, 
            weapon: b1fdata.item
          })
        }
        console.log(players[playerId].coins);
        dialogueDisplay.querySelector("#first-button").replaceWith(dialogueDisplay.querySelector("#first-button").cloneNode(true));
      })
    }
    if(b2func == "item")
    {
      dialogueDisplay.querySelector("#second-button").addEventListener("click", () => {
        if(players[playerId].coins >= b2fdata.price)
        {
          playerRef.update({
            coins: players[playerId].coins - b2fdata.price, 
            weapon: b2fdata.item
          })
        }
        dialogueDisplay.querySelector("#second-button").replaceWith(dialogueDisplay.querySelector("#second-button").cloneNode(true));
      })
    }
    if(b1func == "dialogue")
    {
      dialogueDisplay.querySelector("#first-button").addEventListener("click", () => {
        dialogueDisplay.querySelector("#first-button").replaceWith(dialogueDisplay.querySelector("#first-button").cloneNode(true));
        b1fdata();
      })
    }
    if(b2func == "dialogue")
    {
      dialogueDisplay.querySelector("#second-button").addEventListener("click", () => {
        dialogueDisplay.querySelector("#second-button").replaceWith(dialogueDisplay.querySelector("#second-button").cloneNode(true));
        b2fdata();
      })
    }
    dialogueDisplay.querySelector("#dialogue-text").setAttribute("data-number", number);
  }
  function CloseDialogue() {
    //open a dialogue
    dialogueDisplay.querySelector("#dialogue-text").innerText = "";
    dialogueDisplay.querySelector("#first-button").innerText = "";
    dialogueDisplay.querySelector("#second-button").innerText = "";
    dialogueDisplay.querySelector("#first-button").setAttribute("data-show", "false");
    dialogueDisplay.querySelector("#second-button").setAttribute("data-show", "false");
    dialogueDisplay.querySelector("#exit-button").setAttribute("data-show", "false");
    dialogueDisplay.setAttribute("data-show", "false");
  }

  function initGame() {

    new KeyPressListener("ArrowUp", () => handleArrowPress(0, -1))
    new KeyPressListener("ArrowDown", () => handleArrowPress(0, 1))
    new KeyPressListener("ArrowLeft", () => handleArrowPress(-1, 0))
    new KeyPressListener("ArrowRight", () => handleArrowPress(1, 0))
    new KeyPressListener("KeyW", () => handleArrowPress(0, -1))
    new KeyPressListener("KeyS", () => handleArrowPress(0, 1))
    new KeyPressListener("KeyA", () => handleArrowPress(-1, 0))
    new KeyPressListener("KeyD", () => handleArrowPress(1, 0))
    new KeyPressListener("Space", () => handleAttack())

    const allPlayersRef = firebase.database().ref(`players`);
    const allCoinsRef = firebase.database().ref(`coins`);
    const allPotionsRef = firebase.database().ref(`potions`);
    const allItemsRef = firebase.database().ref(`items`);

    allPlayersRef.on("value", (snapshot) => {
      //change
      players = snapshot.val() || {};
      Object.keys(players).forEach((key) => {
        const characterState = players[key];
        let el = playerElements[key];
        el.querySelector(".Character_name").innerText = characterState.name;
        el.querySelector(".Character_coins").innerText = characterState.coins;
        el.setAttribute("data-color", characterState.color);
        el.setAttribute("data-direction", characterState.direction);
        el.setAttribute("data-weapon", characterState.weapon);
        el.setAttribute("data-location", characterState.location == myLocation ? "some" : "none");
        var luckState = "false";
        if(characterState.potionDuration > 0) {
          luckState = "true";
        }
        el.querySelector(".Luck-effect").setAttribute("data-luck", luckState);
        el.querySelector(".Character_health_bar").setAttribute("data-health", characterState.health);
        el.querySelector(".Character_name").setAttribute("data-location", characterState.location == myLocation ? "some" : "none");
        el.querySelector(".Character_coins").setAttribute("data-location", characterState.location == myLocation ? "some" : "none");
        el.querySelector(".Character_name-container").setAttribute("data-location", characterState.location == myLocation ? "some" : "none");
        el.querySelector(".Character_shadow").setAttribute("data-location", characterState.location == myLocation ? "some" : "none");
        el.querySelector(".Character_health_bar").setAttribute("data-location", characterState.location == myLocation ? "some" : "none");
        const left = 16 * characterState.x + "px";
        const top = 16 * characterState.y - 4 + "px";
        el.style.transform = `translate3d(${left}, ${top}, 0)`;
      })
    })
    allPlayersRef.on("child_added", (snapshot) => {
      //new nodes
      const addedPlayer = snapshot.val();
      const characterElement = document.createElement("div");
      characterElement.classList.add("Character", "grid-cell");
      if(addedPlayer.id === playerId)
      {
        characterElement.classList.add("you");
      }
      characterElement.innerHTML = (`
        <div class="Character_shadow grid-cell"></div>
        <div class="Character_sprite grid-cell"></div>
        <div class="Character_name-container">
          <span class="Character_name"></span>
          <span class="Character_coins">0</span>
        </div>
        <div class="Character_you-arrow"></div>
        <div class="Character_health_bar"></div>
        <div class="Luck-effect"></div>
      `);


      playerElements[addedPlayer.id] = characterElement;
      characterElement.querySelector(".Character_name").innerText = addedPlayer.name;
      characterElement.querySelector(".Character_coins").innerText = addedPlayer.coins;
      characterElement.setAttribute("data-color", addedPlayer.color);
      characterElement.setAttribute("data-direction", addedPlayer.direction);
      characterElement.setAttribute("data-weapon", addedPlayer.weapon);
      const left = 16 * addedPlayer.x + "px";
      const top = 16 * addedPlayer.y - 4 + "px";
      characterElement.style.transform = `translate3d(${left}, ${top}, 0)`;
      gameContainer.appendChild(characterElement);
    })
    allPlayersRef.on("child_removed", (snapshot) => {
      const removedKey = snapshot.val().id;
      gameContainer.removeChild(playerElements[removedKey]);
      delete playerElements[removedKey];
    })

    allCoinsRef.on("value", (snapshot) => {
      coins = snapshot.val() || {};
    });
    allCoinsRef.on("child_added", (snapshot) => {
      const coin = snapshot.val();
      const key = getKeyString(coin.x, coin.y);
      coins[key] = true;

      // Create the DOM Element
      const coinElement = document.createElement("div");
      coinElement.classList.add("Coin", "grid-cell");
      coinElement.innerHTML = `
        <div class="Coin_shadow grid-cell"></div>
        <div class="Coin_sprite grid-cell"></div>
      `;

      //coinElement.querySelector(".Coin_sprite").setAttribute("data-location", players[playerId].location == myLocation ? "some" : "none");
      //coinElement.querySelector(".Coin_shadow").setAttribute("data-location", players[playerId].location == myLocation ? "some" : "none");

      // Position the Element
      const left = 16 * coin.x + "px";
      const top = 16 * coin.y - 4 + "px";
      coinElement.style.transform = `translate3d(${left}, ${top}, 0)`;

      // Keep a reference for removal later and add to DOM
      coinElements[key] = coinElement;
      gameContainer.appendChild(coinElement);
    })
    allCoinsRef.on("child_removed", (snapshot) => {
      const {x, y} = snapshot.val();
      const keyToRemove = getKeyString(x, y);
      gameContainer.removeChild(coinElements[keyToRemove]);
      delete coinElements[keyToRemove];
    })

    allPotionsRef.on("value", (snapshot) => {
      potions = snapshot.val() || {};
    });
    allPotionsRef.on("child_added", (snapshot) => {
      const potion = snapshot.val();
      const key = getKeyString(potion.x, potion.y);
      potions[key] = true;

      // Create the DOM Element
      const potionElement = document.createElement("div");
      potionElement.classList.add("Potion", "grid-cell");
      potionElement.innerHTML = `
        <div class="Potion_shadow grid-cell"></div>
        <div class="Potion_sprite grid-cell"></div>
      `;

      // Position the Element
      const left = 16 * potion.x + "px";
      const top = 16 * potion.y - 4 + "px";
      potionElement.style.transform = `translate3d(${left}, ${top}, 0)`;

      // Keep a reference for removal later and add to DOM
      potionElements[key] = potionElement;
      gameContainer.appendChild(potionElement);
    })
    allPotionsRef.on("child_removed", (snapshot) => {
      const {x, y} = snapshot.val();
      const keyToRemove = getKeyString(x, y);
      gameContainer.removeChild(potionElements[keyToRemove]);
      delete potionElements[keyToRemove];
    })

    allItemsRef.on("value", (snapshot) => {
      items = snapshot.val() || {};
    });
    allItemsRef.on("child_added", (snapshot) => {
      const item = snapshot.val();
      const key = getKeyString(item.x, item.y);
      items[key] = true;

      // Create the DOM Element
      const itemElement = document.createElement("div");
      itemElement.classList.add("Item", "grid-cell");
      itemElement.innerHTML = `
        <div class="Coin_shadow grid-cell"></div>
        <div class="Item_sprite grid-cell"></div>
      `;

      // Position the Element
      const left = 16 * item.x + "px";
      const top = 16 * item.y - 4 + "px";
      itemElement.style.transform = `translate3d(${left}, ${top}, 0)`;
      itemElement.setAttribute("data-type", item.type);

      // Keep a reference for removal later and add to DOM
      itemElements[key] = itemElement;
      gameContainer.appendChild(itemElement);
    })
    allItemsRef.on("child_removed", (snapshot) => {
      const {x, y} = snapshot.val();
      const keyToRemove = getKeyString(x, y);
      gameContainer.removeChild(itemElements[keyToRemove]);
      delete itemElements[keyToRemove];
    })

    playerNameInput.addEventListener("change", (e) => {
      const newName = e.target.value || createName();
      const chatRef = firebase.database().ref(`chat/` + Math.floor(Math.random() * 1000000000000000));
      const date = new Date();
      chatRef.set({
        message: players[playerId].name + " has renamed to " + newName, 
        time: date.getHours() * 10000 + date.getMinutes() * 100 + date.getSeconds(), 
        day:  date.getDate()
      })
      playerNameInput.value = newName;
      playerRef.update({
        name: newName
      });
    })
    playerColorButton.addEventListener("click", () => {
      const mySkinIndex = playerColors.indexOf(players[playerId].color);
      const nextColor = playerColors[mySkinIndex + 1] || playerColors[0];
      playerRef.update({
        color: nextColor
      });
    })
    chatSend.addEventListener("click", () => {
      const chatRef = firebase.database().ref(`chat/` + Math.floor(Math.random() * 1000000000000000));
      const date = new Date();
      var inputMessage = chatInput.value;
      chatRef.set({
        message: inputMessage + " | " + players[playerId].name, 
        time: date.getHours() * 10000 + date.getMinutes() * 100 + date.getSeconds(), 
        day: date.getDate()
      })
      chatInput.value = "";

    })
    const chatRef = firebase.database().ref(`chat`);

    chatRef.on("child_added", (snapshot) => {
      //new nodes
      const addedMessage = snapshot.val();
      const date = new Date();
      if(addedMessage.time >= date.getHours() * 10000 + date.getMinutes() * 100 + date.getSeconds() && addedMessage.day == date.getDate())
      {
        console.log(date.getDate());
        const messageElement = document.createElement("div");
        messageElement.classList.add("Chat-message");
        messageElement.innerHTML = addedMessage.message;

        chatDisplay.appendChild(messageElement);
      }
    })

    durDisplay.innerText = "Current Durability: " + myDurability;
    placeCoin();
    oneSecondLoop();
    tickLoop();
  }
	firebase.auth().onAuthStateChanged((user) =>{
    console.log(user)
    if (user) {
      //You're logged in!
      playerId = user.uid;
      playerRef = firebase.database().ref(`players/${playerId}`);

      const name = createName();
      playerNameInput.value = name;

      const {x, y} = getRandomSafeSpot();


      playerRef.set({
        id: playerId,
        name, 
        direction: "right",
        color: randomFromArray(playerColors),
        x,
        y,
        coins: 0,
        potionDuration: 0,
        health: 5, 
        isDead: false, 
        weapon: "none", 
        location: myLocation, 
      })

      const date = new Date();

      const chatRef = firebase.database().ref(`chat/` + Math.floor(Math.random() * 1000000000000000));
      chatRef.set({
        message: name + " has joined the game", 
        time: date.getHours() * 10000 + date.getMinutes() * 100 + date.getSeconds(), 
        day: date.getDate()
      })

      //Remove me from Firebase when I diconnect
      playerRef.onDisconnect().remove();

      //Begin the game now that we are signed in
      initGame();
    } else {
      //You're logged out.
    }
  })
	firebase.auth().signInAnonymously().catch((error) => {
	    var errorCode = error.code;
	    var errorMessage = error.message;
	    // ...
	    console.log(errorCode, errorMessage);
	});
})();