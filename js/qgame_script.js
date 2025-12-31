

"use strict";
// creating element and placed in perticular class
function element(name, className) {
  var element = document.createElement(name);
  if (className) element.className = className;
  return element;
}

/* Vector */
function Vector(x, y) {
  this.x = x;
  this.y = y;
}
//this is for changing co-ordinates of player
Vector.prototype.plus = function (other) {
  return new Vector(this.x + other.x, this.y + other.y);
};
//this is for changing shape after died
Vector.prototype.times = function (factor) {
  return new Vector(this.x * factor, this.y * factor);
};
//level objects 
//by creating stack of array of element's  in level
function Level(plan) {
  this.width = plan[0].length;
  this.height = plan.length;
  this.grid = [];
  this.actors = [];
  // build the grid
  for (var y = 0; y < this.height; y++) {
    var line = plan[y],
      gridLine = [];
    for (var x = 0; x < this.width; x++) {
      var ch = line[x],
        fieldType = null;
      var Actor = actorChars[ch];
      if (Actor)
        this.actors.push(new Actor(new Vector(x, y), ch));
      else if (ch == "x")
        fieldType = "wall";
      else if (ch == "!")
        fieldType = "lava";
      gridLine.push(fieldType);
    }
    this.grid.push(gridLine);
  }
  this.player = this.actors.filter(function (actor) {
    return actor.type == "player";
  })[0];
  this.status = this.finishDelay = null;
}
Level.prototype.isFinished = function () {
  return this.status != null && this.finishDelay < 0;
}
//create floors which restrict the motion of player
Level.prototype.obstacleAt = function (pos, size) {
  var xStart = Math.floor(pos.x);
  var xEnd = Math.ceil(pos.x + size.x);
  var yStart = Math.floor(pos.y);
  var yEnd = Math.ceil(pos.y + size.y);
  if (xStart < 0 || xEnd > this.width || yStart < 0)
    return "wall";
  if (yEnd > this.height)
    return "lava";
  for (var y = yStart; y < yEnd; y++) {
    for (var x = xStart; x < xEnd; x++) {
      var fieldType = this.grid[y][x];
      if (fieldType) return fieldType;
    }
  }
}
// very important it separete thr player and grids
// Handle the collisions between the player and other dynamic actors.
Level.prototype.actorAt = function (actor) {
  for (var i = 0; i < this.actors.length; i++) {
    var other = this.actors[i];
    if (other != actor &&
      actor.pos.x + actor.size.x > other.pos.x &&
      actor.pos.x < other.pos.x + other.size.x &&
      actor.pos.y + actor.size.y > other.pos.y &&
      actor.pos.y < other.pos.y + other.size.y)
      return other;
  }
};
var maxStep = 0.05;
Level.prototype.animate = function (step, keys) {
  if (this.status != null) {
    this.finishDelay -= step;
  }
  while (step > 0) {
    var thisStep = Math.min(step, maxStep);
    this.actors.forEach(function (actor) {
      actor.act(thisStep, this, keys);
    }, this);
    step -= thisStep;
  }
};
// Handles collisions between the player and other objects
Level.prototype.playerTouched = function (type, actor) {
  if (type == "lava" && this.status == null) {
    this.status = "lost";
    this.finishDelay = 1;
  } else if (type == "coin") {
    this.actors = this.actors.filter(function (other) {
      return other != actor;
    });
    if (!this.actors.some(function (actor) {
      return actor.type == "coin";
    })) {
      this.status = "won";
      this.finishDelay = 1;
    }
  }
};
var actorChars = {
  "@": Player,
  "o": Coin,
  "=": Lava,
  "|": Lava,
  "v": Lava
};
//define our mario
function Player(pos) {
  this.pos = pos.plus(new Vector(0, -0.5));
  this.size = new Vector(0.8, 1.5);
  this.speed = new Vector(0, 0);
}

//create our mario and its movement
Player.prototype.type = "player";
// Horizontal motion
var playerXSpeed = 7;
Player.prototype.moveX = function (step, level, keys) {
  this.speed.x = 0;
  if (keys.left) this.speed.x -= playerXSpeed;
  if (keys.right) this.speed.x += playerXSpeed;

  var motion = new Vector(this.speed.x * step, 0);
  var newPos = this.pos.plus(motion);
  var obstacle = level.obstacleAt(newPos, this.size);
  if (obstacle)
    level.playerTouched(obstacle);
  else
    this.pos = newPos;
};
var gravity = 30;
var jumpSpeed = 17;
Player.prototype.moveY = function (step, level, keys) {
  this.speed.y += step * gravity;
  var motion = new Vector(0, this.speed.y * step);
  var newPos = this.pos.plus(motion);
  var obstacle = level.obstacleAt(newPos, this.size);
  if (obstacle) {
    level.playerTouched(obstacle);
    if (keys.up && this.speed.y > 0)
      this.speed.y = -jumpSpeed;
    else
      this.speed.y = 0;
  } else {
    this.pos = newPos;
  }
};

Player.prototype.act = function (step, level, keys) {
  this.moveX(step, level, keys);
  this.moveY(step, level, keys);

  var otherActor = level.actorAt(this);
  if (otherActor)
    level.playerTouched(otherActor.type, otherActor);
  if (level.status == "lost") {
    this.pos.y += step;
    this.size.y -= step;
  }
};
//lava objects
function Lava(pos, ch) {
  this.pos = pos;
  this.size = new Vector(1, 1);
  if (ch == "=") {
    this.speed = new Vector(2, 0);
  } else if (ch == "|") {
    this.speed = new Vector(0, 2);
  } else if (ch == "v") {
    this.speed = new Vector(0, 3);
    this.repeatPos = pos;
  }
}
Lava.prototype.type = "lava";
Lava.prototype.act = function (step, level) {
  var newPos = this.pos.plus(this.speed.times(step));
  if (!level.obstacleAt(newPos, this.size))
    this.pos = newPos;
  else if (this.repeatPos)
    this.pos = this.repeatPos;
  else
    this.speed = this.speed.times(-1);
};
//coin objects
function Coin(pos) {
  this.basePos = this.pos = pos.plus(new Vector(0.2, 0.1));
  this.size = new Vector(0.6, 0.6);
  this.wobble = Math.random() * Math.PI * 2;
}

Coin.prototype.type = "coin";

var wobbleSpeed = 8,
  wobbleDist = 0.07;
Coin.prototype.act = function (step) {
  this.wobble += step * wobbleSpeed;
  var wobblePos = Math.sin(this.wobble) * wobbleDist;
  this.pos = this.basePos.plus(new Vector(0, wobblePos));
};
//Dom Display objects
function DOMDisplay(parent, level) {
  this.wrap = parent.appendChild(element("div", "game"));
  this.level = level;
  this.wrap.appendChild(this.drawBackground());
  this.actorLayer = null;
  this.drawFrame();
}
var scale = 20;

DOMDisplay.prototype.drawBackground = function () {
  var table = element("table", "background");
  table.style.width = this.level.width * scale + "px";
  this.level.grid.forEach(function (row) {
    var rowelement = table.appendChild(element("tr"));
    rowelement.style.height = scale + "px";
    row.forEach(function (type) {
      rowelement.appendChild(element("td", type));
    });
  });
  return table;
};

DOMDisplay.prototype.drawActors = function () {
  var wrap = element("div");
  this.level.actors.forEach(function (actor) {
    var rect = wrap.appendChild(element("div",
      "actor " + actor.type));
    rect.style.width = actor.size.x * scale + "px";
    rect.style.height = actor.size.y * scale + "px";
    rect.style.left = actor.pos.x * scale + "px";
    rect.style.top = actor.pos.y * scale + "px";
  });
  return wrap;
};
DOMDisplay.prototype.drawFrame = function () {
  if (this.actorLayer)
    this.wrap.removeChild(this.actorLayer);
  this.actorLayer = this.wrap.appendChild(this.drawActors());
  // By adding the level’s current status as a class name to the wrapper, 
  // we can style the player actor slightly differently when the game is won or lost
  this.wrap.className = "game " + (this.level.status || "");
  this.scrollPlayerIntoView();
};
DOMDisplay.prototype.scrollPlayerIntoView = function () {
  var width = this.wrap.clientWidth;
  var height = this.wrap.clientHeight;
  var margin = width / 3;
  var left = this.wrap.scrollLeft,
    right = left + width;
  var top = this.wrap.scrollTop,
    bottom = top + height;

  var player = this.level.player;
  var center = player.pos.plus(player.size.times(0.5)).times(scale);
  if (center.x < left + margin)
    this.wrap.scrollLeft = center.x - margin;
  else if (center.x > right - margin)
    this.wrap.scrollLeft = center.x + margin - width;

  if (center.y < top + margin)
    this.wrap.scrollTop = center.y - margin;
  else if (center.y > bottom - margin)
    this.wrap.scrollTop = center.y + margin - height;
};
DOMDisplay.prototype.clear = function () {
  this.wrap.parentNode.removeChild(this.wrap);
};

var arrowCodes = {
  37: "left",
  38: "up",
  39: "right",
};

/* Q-Learning Agent Implementation */
class QAgent {
  constructor() {
    this.qTable = {}; // State -> Action -> Value
    this.alpha = 0.5; // Learning Rate (High for faster changes)
    this.gamma = 0.9; // Discount Factor
    this.epsilon = 0.2; // Exploration Rate
    this.epsilonMin = 0.01;
    this.epsilonDecay = 0.995;
    this.actions = ['left', 'right', 'up', 'wait'];
    this.episode = 0;
    this.totalReward = 0;
  }

  getQ(state, action) {
    if (!this.qTable[state]) this.qTable[state] = {};
    return this.qTable[state][action] || 0;
  }

  setQ(state, action, value) {
    if (!this.qTable[state]) this.qTable[state] = {};
    this.qTable[state][action] = value;
  }

  // Discretize the state: 5x5 grid around player + velocity direction
  getState(level) {
    let player = level.player;
    let px = Math.floor(player.pos.x);
    let py = Math.floor(player.pos.y);
    let gridView = "";

    // View 2 blocks around player
    for (let y = py - 2; y <= py + 2; y++) {
      for (let x = px - 2; x <= px + 2; x++) {
        // Check bounds and get content
        let type = "empty";
        if (x < 0 || x >= level.width || y < 0) type = "wall";
        else if (y >= level.height) type = "lava";
        else {
          let char = level.grid[y] && level.grid[y][x];
          if (char) type = char; // wall, lava
          // Check for dynamic actors (lava, coin)
          // Simplified: We assume static grid for now for speed, 
          // but strictly we should check actors. 
          // For this simple demo, static grid + player velocity is decent.
        }
        gridView += type[0]; // First char of type
      }
    }

    // Add velocity sign
    let vx = Math.sign(player.speed.x);
    let vy = Math.sign(player.speed.y);
    return `${gridView}_${vx}_${vy}`;
  }

  chooseAction(state) {
    if (Math.random() < this.epsilon) {
      return this.actions[Math.floor(Math.random() * this.actions.length)];
    }

    // Greedy
    let bestAction = this.actions[0];
    let maxQ = this.getQ(state, bestAction);

    for (let action of this.actions) {
      let q = this.getQ(state, action);
      if (q > maxQ) {
        maxQ = q;
        bestAction = action;
      }
    }
    return bestAction;
  }

  learn(state, action, reward, nextState) {
    let maxNextQ = Math.max(...this.actions.map(a => this.getQ(nextState, a)));
    let currentQ = this.getQ(state, action);

    let newQ = currentQ + this.alpha * (reward + this.gamma * maxNextQ - currentQ);
    this.setQ(state, action, newQ);
  }

  endEpisode() {
    this.episode++;
    if (this.epsilon > this.epsilonMin) {
      this.epsilon *= this.epsilonDecay;
    }

    // Update UI
    document.getElementById('episode-display').querySelector('span').innerText = this.episode;
    document.getElementById('score-display').querySelector('span').innerText = this.totalReward.toFixed(1);
    document.getElementById('epsilon-display').querySelector('span').innerText = this.epsilon.toFixed(3);

    this.totalReward = 0;
  }
}

// -------------------------------------------------------------
// Modified Game Loop for AI
// -------------------------------------------------------------

function runLevel(level, Display, andThen) {
  var display = new Display(document.body, level);

  // Initialize Agent
  if (!window.agent) window.agent = new QAgent();
  var agent = window.agent;

  var running = "yes";
  var lastX = level.player.pos.x; // To track progress

  function animation(step) {
    if (running == "no") return false;

    // 1. Get Current State
    let state = agent.getState(level);

    // 2. Choose Action
    let action = agent.chooseAction(state);
    document.getElementById('action-stat').querySelector('span').innerText = action.toUpperCase();

    // Convert action to 'keys' object for game logic
    let keys = {
      left: action === 'left',
      right: action === 'right',
      up: action === 'up',
      // Ensure specific keys are respected
      37: action === 'left',
      38: action === 'up',
      39: action === 'right'
    };

    // 3. Step Physics (Simulate one frame)
    // Use fixed step for consistent learning
    let simStep = 0.05;
    level.animate(simStep, keys);
    display.drawFrame(simStep);

    // 4. Calculate Reward
    let reward = -0.1; // Living penalty (encourage speed)
    let nextX = level.player.pos.x;

    // Reward for moving right
    if (nextX > lastX) {
      reward += (nextX - lastX) * 10;
    }

    // Log Logic
    let logContainer = document.getElementById('log-container');
    if (logContainer && Math.random() < 0.05) { // Log occasionally to avoid flooding
      let msg = `> Action: ${action.toUpperCase()} | Reward: ${reward.toFixed(2)} | X: ${nextX.toFixed(1)}`;
      let div = document.createElement('div');
      div.className = 'log-entry';
      div.innerText = msg;
      logContainer.appendChild(div);
      logContainer.scrollTop = logContainer.scrollHeight;
    }

    // Reward for coins (status check)
    // Note: strict validation would check actor changes, 
    // here we simplify: if status is won, huge reward.

    // Check game status
    if (level.isFinished()) {
      if (level.status == "won") {
        reward += 1000;
      } else if (level.status == "lost") {
        reward -= 100;
      }
    }

    lastX = nextX;
    agent.totalReward += reward;

    // 5. Learn
    let nextState = agent.getState(level);
    agent.learn(state, action, reward, nextState);

    if (level.isFinished()) {
      display.clear();
      agent.endEpisode();
      if (andThen) andThen(level.status);
      return false;
    }

    return true; // Continue
  }

  // Use a faster animation loop for training if desired, 
  // but standard RAF is fine for visualization.
  runAnimation(animation);
}

function runGame(plans, Display) {
  function startLevel(n) {
    // Infinite Loop: If won or lost, restart same level or next, but keep training
    runLevel(new Level(plans[n]), Display, function (status) {
      if (status == "lost") {
        startLevel(n); // Retry same level
      } else if (n < plans.length - 1) {
        startLevel(n + 1); // Next level
      } else {
        console.log("You win! Restarting...");
        startLevel(0); // Restart game
      }
    });
  }
  startLevel(0);
}

// Start Game
runGame(GAME_LEVELS, DOMDisplay);