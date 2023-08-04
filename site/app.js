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
const mapData = {
  minX: 1,
  maxX: 14,
  minY: 4,
  maxY: 12,
  blockedSpaces: {
    "7x4": true,
    "1x11": true,
    "12x10": true,
    "7x7": true,
    "7x9": true,
    "8x9": true,
    "9x9": true,
  },
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
    "COOL",
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
function isSolid(x, y) {
  const blockedNextSpace = mapData.blockedSpaces[getKeyString(x, y)];
  return (
    blockedNextSpace || 
    x >= mapData.maxX || 
    x < mapData.minX || 
    y >= mapData.maxY || 
    y < mapData.minY
  )
}
function getRandomSafeSpot() {
  //We don't look things up by key here, so just return an x/y
  return randomFromArray([
    { x: 1, y: 4 },
    { x: 2, y: 4 },
    { x: 1, y: 5 },
    { x: 2, y: 6 },
    { x: 2, y: 8 },
    { x: 2, y: 9 },
    { x: 4, y: 8 },
    { x: 5, y: 5 },
    { x: 5, y: 8 },
    { x: 5, y: 10 },
    { x: 5, y: 11 },
    { x: 11, y: 7 },
    { x: 12, y: 7 },
    { x: 13, y: 7 },
    { x: 13, y: 6 },
    { x: 13, y: 8 },
    { x: 7, y: 6 },
    { x: 7, y: 8 },
    { x: 8, y: 8 },
    { x: 10, y: 8 },
    { x: 8, y: 8 },
    { x: 11, y: 4 },
  ]);
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

    const coinRef = firebase.database().ref(`coins/${getKeyString(x, y)}`);
    coinRef.set({
      x, 
      y
    })

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
          respawnContainer.querySelector(".respawnButton").remove();
          const {x, y} = getRandomSafeSpot();
          playerRef.update({
            isDead: false, 
            coins: 0, 
            health: 5, 
            x, 
            y
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
    }

    //repeat
    setTimeout(() => {
      tickLoop();
    }, 1);
  }
  function attemptGrabCoin(x, y) {
    const key = getKeyString(x, y);
    if (coins[key]) {
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
      firebase.database().ref(`items/${key}`).remove();
    }
  }
  function handleArrowPress(xChange=0, yChange=0) {
    const newX = players[playerId].x + xChange;
    const newY = players[playerId].y + yChange;
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
    }
  }
  function handleAttack() {
    var attackX;
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
        playerToAttackRef.update({
          health: players[playerToAttack].health - damage
        })
        if(players[playerToAttack].health - damage <= -1) {
          playerRef.update({
            coins: players[playerId].coins + players[playerToAttack].coins
          })
          if(players[playerToAttack].weapon != "none")
          {
            playerRef.update({
              weapon: players[playerToAttack].weapon
            })
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
        playerToAttackRef.update({
          health: players[playerToAttack].health - damage
        })
        if(players[playerToAttack].health - damage <= -1) {
          playerRef.update({
            coins: players[playerId].coins + players[playerToAttack].coins
          })
          if(players[playerToAttack].weapon != "none")
          {
            playerRef.update({
              weapon: players[playerToAttack].weapon
            })
          }
          playerToAttackRef.update({
            coins: 0, 
            weapon: "none"
          })
        }
      }
    }
  }

  function initGame() {

    new KeyPressListener("ArrowUp", () => handleArrowPress(0, -1))
    new KeyPressListener("ArrowDown", () => handleArrowPress(0, 1))
    new KeyPressListener("ArrowLeft", () => handleArrowPress(-1, 0))
    new KeyPressListener("ArrowRight", () => handleArrowPress(1, 0))
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
        var luckState = "false";
        if(characterState.potionDuration > 0) {
          luckState = "true";
        }
        el.querySelector(".Luck-effect").setAttribute("data-luck", luckState);
        el.querySelector(".Character_health_bar").setAttribute("data-health", characterState.health);
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
        day:  date.getDay()
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
        day: date.getDay()
      })
      chatInput.value = "";

    })
    const chatRef = firebase.database().ref(`chat`);

    chatRef.on("child_added", (snapshot) => {
      //new nodes
      const addedMessage = snapshot.val();
      const date = new Date();
      if(addedMessage.time >= date.getHours() * 10000 + date.getMinutes() * 100 + date.getSeconds() && addedMessage.day == date.getDay())
      {
        const messageElement = document.createElement("div");
        messageElement.classList.add("Chat-message");
        messageElement.innerHTML = addedMessage.message;

        chatDisplay.appendChild(messageElement);
      }
    })

    placeCoin();
    oneSecondLoop();
    tickLoop();
  }
	firebase.auth().onAuthStateChanged((user) => {
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
      })

      const date = new Date();

      const chatRef = firebase.database().ref(`chat/` + Math.floor(Math.random() * 1000000000000000));
      chatRef.set({
        message: name + " has joined the game", 
        time: date.getHours() * 10000 + date.getMinutes() * 100 + date.getSeconds(), 
        day: date.getDay()
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