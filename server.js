var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);


//Functions that check whether the current player is colliding with either the gameboard
//boundaries, any of the other players, or any of the food objects
//Args: middle coords of first box (x1, y1)
//      middle coords of second box (x2, y2)
//      rad1 (distance from center of first box to its edge)
//      rad2 (distance from center of second box to its edge)
//Invariant: box length = 2*rad + 1
//Returns: true if the boxes overlap, else false
//Modifies: none
function check_overlap(x1, y1, x2, y2, rad1, rad2) {
  if ( (x1+rad1 >= x2-rad2 && x1+rad1 <= x2+rad2) || (x1-rad1 <= x2+rad2 && x1+rad1 >= x2-rad2) ) {
    if ( (y1+rad1 >= y2-rad2 && y1+rad1 <= y2+rad2) || (y1-rad1 <= y2+rad2 && y1-rad1 >= y2-rad2) ) {
      return true;
    }
  }
  return false;
}

//checkCollision_Board checks if player has run into edge of board
//Args: player obj to check for collision, game obj
//Returns: true if p1 collides with edge of board, else false
//Modifies: none
function checkCollision_Board(p1,g) {
  if (p1.alive) {
    if (p1.pos_list[0][0]+5 >= g.board.x || p1.pos_list[0][1]+5 >= g.board.y) {
      return true;
    }
    else if (p1.pos_list[0][0]-5 <= 0 || p1.pos_list[0][1]-5 <= 0) {
      return true;
    }
    return false;
  }
}

//checkCollision_Player checks for collision between two players
//Args: player object doing the colliding, player object recieving the impact
//Returns: true if p1 collided with p2, else false
//Modifies: none
function checkCollision_Player(p1, p2) {
  if (p1.alive) {
    if (check_overlap(p1.pos_list[0][0], p1.pos_list[0][1], p2.pos_list[0][0], p2.pos_list[0][1], 5,5)) {
      if(p1.pos_list[0][0] < p2.pos_list[0][0] && p1.direction == "right" && (p2.direction == "left" || p2.alive) ||
        p1.pos_list[0][0] > p2.pos_list[0][0] && p1.direction == "left" && (p2.direction == "right" || p2.alive) ||
        p1.pos_list[0][1] < p2.pos_list[0][1] && p1.direction == "down" && (p2.direction == "up" || p2.alive) ||
        p1.pos_list[0][1] > p2.pos_list[0][1] && p1.direction == "up" && (p2.direction == "down" || p2.alive) )
      {
        return true;
      }
    }
    // check the rest of the body for collisions
    for (var i = 1; i < p2.pos_list.length; i++) {
      if (check_overlap(p1.pos_list[0][0], p1.pos_list[0][1], p2.pos_list[i][0], p2.pos_list[i][1], 5,5) == true) {
        return true;
      }
    }
  }
  return false;
}

// checkCollision_Food takes a player p1 and a list of food objects foods and returns true if p1
// hits any one of the the objects in foods
//Args: player to check collision with, food list 
//Returns: true if player collides with a food, else false
//Modifies: none
function checkCollision_Food(p1, foods) {
  if (p1.alive){
    return check_overlap(p1.pos_list[0][0], p1.pos_list[0][1], foods.x, foods.y, 5,5);
  }
}


//function to tranform a dead snake into an appropriate number
//of non-overlapping foods
//Args: dead player object, game obj
//Returns: none
//Modifies: game obj
function convertFood(p1, g) {
  for (var i = 1; i < p1.length; i+=2) {
    let food_temp = { x:p1.pos_list[i][0], y:p1.pos_list[i][1] };
    let locationsNotValidated = true;
    while(locationsNotValidated) {
      let fx = food_temp.x;
      let fy = food_temp.y;
      let currFoodValid = true
      for(let i=0; i<g.foods.length; i++) {
        if(check_overlap(fx, fy, g.foods[i].x, g.foods[i].y, 5,5)) {//could be 5,5
          currFoodValid = false;
        }
      }
      /*//check for spawning on top of players ... leaving this out unless it causes a bug
      for(let k in g.players){
        for(let i=0; i<g.players[k].pos_list.length; i++){
          if(check_overlap(fx, fy, g.players[k].pos_list[i].x, g.players[k].pos_list[i].y, 6,6)){
            currFoodValid = false;
          }
        }
      }*/
      if(currFoodValid) {
        g.foods.push({x:fx, y:fy});
      }
      if(g.foods.length >= 10) {
        locationsNotValidated = false;
      }
    }//END WHILE
  }
}

//function to call all other collision functions which trigger game events
//main source of changes to game obj after movements are applied
//Args: player obj to check events for, game obj
//Returns: none
//Modifies: player,  game
function checkGameEvents(p1, g) {
  if (checkCollision_Board(p1, g)) {
    p1.alive = false;
    delete g.name2id[p1.name];
    delete g.players[p1.playerId];
    convertFood(p1,g);
    return;
  }

    for (let id in g.players) {
    if(p1.playerId != g.players[id].playerId) {
      let adjust_score = true;
      if (checkCollision_Player(p1,g.players[id])) {
        //trying to recheck to see if it was head to head and then if it was head on
        if (check_overlap(p1.pos_list[0][0], p1.pos_list[0][1], g.players[id].pos_list[0][0], g.players[id].pos_list[0][1], 5,5)) {
          //yes head to head
          console.log("head to head");
          //check if it was head on, if so delete both
            convertFood(g.players[id],g);
            adjust_score = false;
            g.players[id].alive = false;
            delete g.name2id[g.players[id].name];
            delete g.players[g.players[id].playerId];
        }
        p1.alive = false;
        convertFood(p1,g);
        delete g.name2id[p1.name];
        delete g.players[p1.playerId];
        if(adjust_score) {
          g.players[id].score += 50;
        }
        
        return;
      }
    }
  }

  //check for collisions with each food on board 
  //if so: delete eaten food, grow snake, add replacement food 
  for (var i = 0; i < g.foods.length; i++) {
    if (checkCollision_Food(p1, g.foods[i])) {
      p1.score += 10;
      g.foods.splice(i, 1);
      p1.path_len += 12;//changed from 6 to mitigate overeating bug...
      
      p1.pos_list.push([p1.path[p1.length*6][0], p1.path[p1.length*6][1]]);
      p1.length += 1;

      if(g.foods.length < 30) {
        addFood(g);
      }
    }
  }
}


//Function to convert key codes to direction strings
//Args: int keyCode
//Returns: string containing relevant direction
//if key is not a,w,s,d,up,down,left,right string will be empty
//Modifies: none
function keyToDir(keyCode) {
//keyCode Reference for likely keys:
//'w'=87, 'a'=65, 's'=83, 'd'=68, SHIFT=16, SPACE=32, 'e'=69, 'q'=81
//UP=38, DOWN=40, LEFT=37, RIGHT=39, ENTER=13
    switch (keyCode) {
        case 87: return('up'); break;
        case 83: return('down'); break;
        case 68: return('right'); break;
        case 65: return('left'); break;
        case 38: return('up'); break;
        case 40: return('down'); break;
        case 39: return('right'); break;
        case 37: return('left'); break;
        default: return(''); //uncomment to check other key codes
    }
}

//Function to randomly choose an initial direction for a snake
//Args: none
//Returns: string: 'up', 'down', 'left', 'right'
//Modifies: none
function initSnakeDirection() {
  let randNum = Math.floor(Math.random() * Math.floor(4));//returns 0,1,2, or 3
  let dir = '';
  switch (randNum) {
    case 0: dir = 'up'; break;
    case 1: dir = 'right'; break;
    case 2: dir = 'down'; break;
    case 3: dir = 'left'; break;
  }
  return dir;
}

//Function to randomly select color/skin of snake
//Returns: an int 1,2,...10 since there are 10 skins right now
//Args: none
//Modifies: none
function initColor() {
  return Math.floor(Math.random() * Math.floor(10)) + 1
}


//Function to add a single food after one has been eaten
//Args: game object
//Returns: none
//Modifies: food list of game object
function addFood(g) {
  let locationsNotValidated = true;
  while(locationsNotValidated) {
    let fx = Math.floor(Math.random() * 628) + 6; //current board is 640px X 640px so
    let fy = Math.floor(Math.random() * 628) + 6; //place player randomly between 160px-480px
    let currFoodValid = true
    for(let i=0; i<g.foods.length; i++) {
      if(check_overlap(fx, fy, g.foods[i].x, g.foods[i].y, 6,6)) {//could be 5,5
        currFoodValid = false;
      }
    }
    for(let k in g.players) {
      for(let i=0; i<g.players[k].pos_list.length; i++) {
        if(check_overlap(fx, fy, g.players[k].pos_list[i].x, g.players[k].pos_list[i].y, 6,6)) {
          currFoodValid = false;
        }
      }
    }
    if(currFoodValid){
      g.foods.push({x:fx, y:fy});
    }
    if(g.foods.length >= 30) {
      locationsNotValidated = false;
    }
  }
}

//Function to initialize a list of 10 foods when games starts
//Food will be within 6px of the edge and will not overlap with
//any other food
//Args: (game) but going global to be safe
//Returns:
//Modifies: game.foods
function initFoods(g) {
  var arr = [];
  let locationsNotValidated = true;
  while(locationsNotValidated) {
    let fx = Math.floor(Math.random() * 628) + 6; //current board is 640px X 640px so
    let fy = Math.floor(Math.random() * 628) + 6; //place player randomly between 160px-480px
    let currFoodValid = true
    for(let i=0; i<arr.length; i++) {
      if(check_overlap(fx, fy, arr[i].x, arr[i].y, 6)) {
        currFoodValid = false;
      }
    }
    if(currFoodValid) {
      arr.push({x:fx, y:fy});
    }
    if(arr.length >= 30) {
      locationsNotValidated = false;
    }
  }
  g.foods = arr;
}


//Function to generate initial array of locations for a snake
//as well as the initial direction of the snake at random
//Args: desired start length of snake, players list to check for
//      collisions with other snakes (initially I wanted to take an
//      empty array, arr, as an arg and return by reference but
//      it wasnt working so now we create arr and return directly)
//Returns: array of locations (by reference)
//playersObj may need to be whole game object (this function needs to
// call the collision detection functions, so it requires the same things)
//Requires: length is set, directions is set, arr is empty
function initSnakeLocations(/*arr,*/ length, direction, g) {
  var arr = [];
  let locationsNotValidated = true;
  while(locationsNotValidated){
    //generate length many locations specified direction
    let x = Math.floor(Math.random() * 320) + 160; //current board is 640px X 640px so
    let y = Math.floor(Math.random() * 320) + 160; //place player randomly between 160px-480px (not too close to edge)
    let tmp_arr = [];
    tmp_arr.push([x,y]);
    let i;
    for(i=1; i<length; i++) {
      //generating points points based on direction, points are 5 px apart
      let offset = i*6;
      switch (direction) {
        case 'up': tmp_arr.push( [ x, (y+offset) ] ); break;
        case 'right': tmp_arr.push( [ (x-offset), y ] ); break;
        case 'down': tmp_arr.push( [ x, (y-offset) ] ); break;
        case 'left': tmp_arr.push( [ (x+offset), y ] ); break;
      }
    }
    //call collision detection on each location
    let validated = true;
    if(g) {//if game is intialized
      if(g.players.length > 1) {//if its not the first player
        for(i=0; i<length; i++) {//for each coord in tmp_arr
          for(let k in g.players) {
            for(let j=0; j<g.players[k].pos_list.length; j++) {//for each coord in each existing player
              if(check_overlap(g.players[k].pos_list[j][0], g.players[k].pos_list[j][1], tmp_arr[i][0], tmp_arr[i][1], 50,50)) {//17,17
                validated = false;
                break;
              }
              if(!validated) {
                break;
              }
            }
            if(!validated){ 
              break;
            }
          }
          if(!validated) {
            break;
          }
        }
      }
    }
    
    //if all locations are valid, then save to exit loop, else generate new random locations
    if(validated){
      locationsNotValidated = false; //the locs are valid, loop will exit
      arr = tmp_arr;
    }
  }//end while
  return arr;
}

//Function to create initial path for snake's body segments
//Requires: snakes pos_list has been initialized
//Args: snake length, direction, pos_list of snake
//Returns: array of coords (a path the snake as traveled and which
//body segments must travel to follow the head)changed direction to
function initPath(length, dir, arr) {
  var tmp_path = [];
  let i;
  let px_len = (length * 6) + 12; 
  //start by storing head in x,y and adding to path
  let x = arr[0][0];
  let y = arr[0][1];
  tmp_path.push([x,y]);
  for(i=1; i<px_len; i++) {
    //generating points points based on direction, points are 1 px apart
    switch (dir) {
      case 'up':
        y = y + 1;
        tmp_path.push([x,y]);
        break;
      case 'right':
        x = x - 1;
        tmp_path.push([x,y]);
        break;
      case 'down':
        y = y - 1;
        tmp_path.push([x,y]);
        break;
      case 'left':
        x = x + 1;
        tmp_path.push([x,y]);
        break;
      }
    }
    return tmp_path;
}

//Function to move snake forward one unit
//Args: reference to game object
//Returns: none, changes made to referenced object
//Requires: game is initialized
function moveSnakes() {
    //arbitraily going to move the snake 1px...no clue how this will go
    for(var key in game.players) {
        if(!game.players[key].alive) {
          continue;
        }
        let change_x = 0, change_y = 0;
        cur_dir = game.players[key].direction
        if(cur_dir == 'up') {//up
            change_y = -1 * game.players[key].velocity;
        }
        else if(cur_dir == 'right') {//right
            change_x = 1 * game.players[key].velocity;
        }
        else if(cur_dir == 'down') {//down
            change_y = 1 * game.players[key].velocity;
        }
        else {//left
            change_x = -1 * game.players[key].velocity;
        }
        
        //move head of snake
        game.players[key].pos_list[0][0] += change_x;
        game.players[key].pos_list[0][1] += change_y;

        //push new loc to front of path queue and all points in between in velocity
        if(cur_dir == 'up') {//up
          for(let i = game.players[key].velocity - 1; i >= 0; i--) {
            game.players[key].path.unshift([game.players[key].pos_list[0][0],game.players[key].pos_list[0][1]+i]);
          }
        }else if(cur_dir == 'right') {//right
          for(let i = game.players[key].velocity - 1; i >= 0; i--) {
            game.players[key].path.unshift([game.players[key].pos_list[0][0]-i,game.players[key].pos_list[0][1]]);
          }
        }else if(cur_dir == 'down') {//down
          for(let i = game.players[key].velocity - 1; i >= 0; i--) {
            game.players[key].path.unshift([game.players[key].pos_list[0][0],game.players[key].pos_list[0][1]-i]);
          }
        }else {//left
          for(let i = game.players[key].velocity - 1; i >= 0; i--) {
            game.players[key].path.unshift([game.players[key].pos_list[0][0]+i,game.players[key].pos_list[0][1]]);
          }
        }

        //loop through segment coords and get new coord off path
        for(let i=1; i < game.players[key].length; i++) {
            game.players[key].pos_list[i][0] = game.players[key].path[i*6][0];
            game.players[key].pos_list[i][1] = game.players[key].path[i*6][1];
        }

        while(game.players[key].path.length > game.players[key].path_len) {//was if
          //we dont need to store extra coords until another segment is add
          //which means we have enough room to add a segment if needed
          game.players[key].path.pop();//so pop last value
        }
    }
}

//function to adjust the boost levels of all players
//Args: none (accesses global game obj)
//Returns: none
//Modifies: game obj
function updateBoosts() {
  for(var key in game.players) {
    if(game.players[key].boosting) {
      //decrease boost meter
      game.players[key].boost_level -= 1;//WAS 0.25 but testing with 1
    }
    else {
      //increase boos meter
      game.players[key].boost_level += 0.5;
    }
    if(game.players[key].boost_level > game.players[key].boost_cap) {
      game.players[key].boost_level = game.players[key].boost_cap;
    }
    if(game.players[key].boost_level < 0) {
      game.players[key].boost_level = 0;
    }
    //adjust velocity based on input and boost meter
    if(game.players[key].boosting && game.players[key].boost_level > 0) {
      game.players[key].velocity = 5;
    }
    else {
      game.players[key].velocity = 2;
    }
  }

}

////////////////////////////////Global Declarations////////////////////////////
//Game Object Creation
var game = {
    players: {},
    foods: [],
    board: {x: 640, y: 640},
    name2id: {}
};

var ids2names = {};//servers own record of names and ids for all players
//used to access info after players are deleted

initFoods(game);

//creating global input queue
//relevant array functionality:
//unshift(): add to front (returns new length of array if you want)
//pop(): remove from back (returns value removed)
//length: returns length
var inputQueue = []

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  	res.sendFile(__dirname + '/public/proto_index.html');
});

var update_count = 0; //global var to trigger authoritative updates
//gamestate is update every 15ms, but we will only send updates every 45 ms
//so this counter will be used to trigger updates every three runs
//(not in use with naive implementation)

/////////////////////////////END Global Declarations///////////////////////////


//MAIN GAME UPDATE LOOP
//uses anonymous function, takes game object as global var
//runs every 15 ms
//Modifies: game
//"authoritativeUpdate" emit located here
setInterval(function() {
    if(game) {
         //1. UPDATE PLAYER DIRECTIONS BASED ON INPUTS
        let i;
        let len = 0;
        if(game.players) {
            len = inputQueue.length;
        }
        for(i = 0; i < len; i++) {
            let input = inputQueue.pop();//input is [socket.id, key_code]
            //process each input
            //if input toggles boost:
            if (input[1] == true || input[1] == false) {
              if(input[0] in game.players){
                if(game.players[input[0]].alive){
                  game.players[input[0]].boosting = input[1];
                }
              }
            }
            else {//input changes direction
              if(input[0] in game.players) {
                if(game.players[input[0]].alive) {
                  game.players[input[0]].direction = keyToDir(input[1]);
                }
              }
            }
        }

        //1.5 UPDATE BOOST METERS AND VELOCITY
        updateBoosts();

        //2. UPDATE PLAYER LOCATIONS BASED ON DIRECTION
        moveSnakes();

        //3. UPDATE PLAYERS BASED ON GAME EVENTS (check various types of collisions)
        //change score, aliveness, length, food locations
        for(let id in game.players) {
          checkGameEvents(game.players[id], game);
        }

        //CURRENTLY SENDING AUTHORITATIVE UPDATE EVERY TIME (naive implementation w/o client prediction)
        io.sockets.emit('authoritativeUpdate', game);
        //ENEABLE FOLLOWING CODE TO SEPARATE LOCAL UPDATE AND AUTHORITATIVE UPDATE
        //update_count++;//we want three updates per emit so heres where we track it
        //if(update_count == 3){
            //emit new current authoritative gamestate (by sending entire game object?)
            //io.sockets.emit('authoritativeUpdate', game);
            //update_count = 0;
        //}
        
        //DEBUG CODE
        //for(let key in game.players){
          //console.log("player name: " + game.players[key].name + " has a length of " + game.players[key].length);
          //console.log("their path_len is " + game.players[key].paht_len + " their path has a len " + game.players[key].path.length);
        //}
        //if (game.foods){
        //console.log("last two food locs are: ( "+ game.foods[game.foods.length - 1].x +" , " + game.foods[game.foods.length - 1].y + " ) ( "+ game.foods[game.foods.length - 2].x +" , " + game.foods[game.foods.length - 2].y + " )");
        //}//END DEBUG CODE
    } 

}, 1000/15);// call func every 15 ms


//ALL SERVER EVENT LISTENERS ARE CALLED ON CONNECTION WITHIN THIS FUNCTION
io.on('connection', function (socket) {
  	console.log('a user connected with socket id: ' + socket.id );

    //on connections generate a random snake for new player
    snakeLen = 4;//set initial length to whatever we want 

    //first pick a direction at random:
    var snakeDir = initSnakeDirection();

    var snakeLocs = initSnakeLocations(snakeLen, snakeDir, game);//building intital array of snake locations

    var snakePath = initPath(snakeLen, snakeDir, snakeLocs);//building intital path for segments to follow

  	game.players[socket.id] = {
      pos_list: snakeLocs,
    	playerId: socket.id,
    	name: 'Guest', //changes on connection via 'initPlayer' message
      direction: snakeDir,
      length: snakeLen,
      score: 0,
      velocity: 2, //initial velocity (current boost set to 5)
      color: initColor(),
      alive: true,
      path: snakePath,
      path_len: (snakeLen*6) + 12, //12 to add some extra breathing room after initialization
      boost_level: 100, //type: double
      boost_cap: 100,
      boosting: false
  	};

  	socket.on('initPlayer', function(data) {//initPlayer emitted after player recieves CONNACK
  		//change name in player object
  		game.players[socket.id].name = data.playerName;//data.playerName is incoming info from client
      game.name2id[data.playerName] = socket.id;
      io.sockets.emit('passID', game);
      ids2names[socket.io] = data.playerName;
      //logs for testing:
  		//console.log('player name, ' + data.playerName + ' recieved from ' + socket.id +', updating player object');
  		//console.log('Player ' + socket.id + ' name updated to ' + game.players[socket.id].name);
      //console.log('length: ' + game.players[socket.id].length + ' path_len: ' + game.players[socket.id].path_len);
      //console.log('length of pos list: ' +game.players[socket.id].pos_list.length+ ' length of path array: ' +game.players[socket.id].path.length);
		  //console.log(game.players[socket.id].name + "'s initial direction is: " + game.players[socket.id].direction );
		  //console.log(game.players[socket.id].name, "location array is:", game.players[socket.id].pos_list);
  	});

  	//when the client emits a 'playerMovement' msg we catch the data here
  	socket.on('playerMovement', function(data) {
  		//add client keyboard inputs to the input queue to be dealt with during update function
      if(game.players[socket.id]) {
        inputQueue.unshift([socket.id, data.input]);//data.input is a number (key code)
      }
  	});

    socket.on('playerBoost', function(data) {
      inputQueue.unshift([socket.id, data.input]);//data.input is bool, true/false
    });

  	socket.on('disconnect', function () {
    	console.log('user '+ socket.id +' disconnected');
    	//remove this player from our players object
      delete game.name2id[ids2names[socket.id]];
    	delete game.players[socket.id];
      delete ids2names[socket.id];
    	io.emit('disconnect', socket.id);
  	});

});

server.listen(8081, function () {
  	console.log(`Listening on ${server.address().port}`);
});
