var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);


// Functions that check whether the current player is colliding with either the gameboard
// boundaries, any of the other players, or any of the food objects

function check_overlap(x1, y1, x2, y2, rad1, rad2){
  if ( (x1+rad1 >= x2-rad2 && x1+rad1 <= x2+rad2) || (x1-rad1 <= x2+rad2 && x1+rad1 >= x2-rad2) ) {
    if ( (y1+rad1 >= y2-rad2 && y1+rad1 <= y2+rad2) || (y1-rad1 <= y2+rad2 && y1-rad1 >= y2-rad2) ){
      return true;
    }
  }
  return false;
}
// checkCollision_Board takes a player p1 and gameboard g and returns true if p1
// has hit the boundaries of g
function checkCollision_Board(p1,g) {
  if (p1.alive){
    if (p1.pos_list[0][0]+5 >= g.board.x || p1.pos_list[0][1]+5 >= g.board.y) {return true;}
    else if (p1.pos_list[0][0]-5 <= 0 || p1.pos_list[0][1]-5 <= 0) {return true;}
    return false;
  }
}

// checkCollision_Player takes two players p1 and p2 and returns true if p1 hits the hitbox of p2
function checkCollision_Player(p1, p2) {
  if (p1.alive) {
    
    if(p2.alive) {
      // if player 2 is still alive, all that matters is if we hit them, so check that the relative
      // coordinates and orientations line up
      if (check_overlap(p1.pos_list[0][0], p1.pos_list[0][1], p2.pos_list[0][0], p2.pos_list[0][1], 5,5)) {
        if(p1.pos_list[0][0] < p2.pos_list[0][0] && p1.direction == "right" ||
           p1.pos_list[0][0] > p2.pos_list[0][0] && p1.direction == "left" ||
           p1.pos_list[0][1] < p2.pos_list[0][1] && p1.direction == "down" ||
           p1.pos_list[0][1] > p2.pos_list[0][1] && p1.direction == "up")
        {
          return true;
        }
      }
    } else {
      // if the other player *isn't* alive, we only die if the collision was head-on
      // therefore we add an extra element to the conditional to check that that's what happened
      if (check_overlap(p1.pos_list[0][0], p1.pos_list[0][1], p2.pos_list[0][0], p2.pos_list[0][1], 5,5)) {
        if(p1.pos_list[0][0] < p2.pos_list[0][0] && p1.direction == "right" && p2.direction == "left" ||
           p1.pos_list[0][0] > p2.pos_list[0][0] && p1.direction == "left" && p2.direction == "right" ||
           p1.pos_list[0][1] < p2.pos_list[0][1] && p1.direction == "down" && p2.direction == "up"  ||
           p1.pos_list[0][1] > p2.pos_list[0][1] && p1.direction == "up" && p2.direction == "down")
        {
          return true;
        }
      }
    }
    
    
    // check the rest of the body for collisions
    for (var i = 1; i < p2.pos_list.length; i++) {
        //console.log("i: " + i);
      if (check_overlap(p1.pos_list[0][0], p1.pos_list[0][1], p2.pos_list[i][0], p2.pos_list[i][1], 5,5) == true) {
        return true;
      }
    }
    
  }
  return false;
}

// checkCollision_Food takes a player p1 and a list of food objects foods and returns true if p1
// hits any one of the the objects in foods
function checkCollision_Food(p1, foods) {
  if (p1.alive){
    return check_overlap(p1.pos_list[0][0], p1.pos_list[0][1], foods.x, foods.y, 5,5);
  }
}


// ======================================================================================================
function convertFood(p1, g){
  for (var i = 1; i < p1.length; i+=2) {
    let food_temp = { x:p1.pos_list[i][0], y:p1.pos_list[i][1] };
    let locationsNotValidated = true;
    while(locationsNotValidated){
      let fx = food_temp.x;
      let fy = food_temp.y;
      let currFoodValid = true
      for(let i=0; i<g.foods.length; i++){
        if(check_overlap(fx, fy, g.foods[i].x, g.foods[i].y, 5,5)){//could be 5,5
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
      if(currFoodValid){
        g.foods.push({x:fx, y:fy});
      }
      if(g.foods.length >= 10){
        locationsNotValidated = false;
      }
    }//END WHILE
    //g.foods.push(food_temp);
  }
}

function checkGameEvents(p1, g){
  if (checkCollision_Board(p1, g)) {
      //console.log("q");
    p1.alive = false;
    //delete g.players[p1.playerId];
    convertFood(p1,g);
  }

    for (let id in g.players) {
    if(p1.playerId != g.players[id].playerId){
      if (checkCollision_Player(p1,g.players[id])){
        //console.log("THERE WAS A COLLISION");
        p1.alive = false;
        //delete g.players[p1.playerId];
        g.players[id].score += 100;
        convertFood(p1,g);
      }
    }
  }
  
  //console.log("g.foods.length: " + g.foods.length);
  for (var i = 0; i < g.foods.length; i++) {
      //console.log("apple");
    if (checkCollision_Food(p1, g.foods[i])){
      p1.score += 10;
      g.foods.splice(i, 1);
      p1.path_len += 12;//changed from 6 to mitigate overeating bug...
      //unfortunately this will grow our array far beyond what we need
      //pretty sure this is an upper bound, there are more efficient solutions...
      //console.log("p1.length: " + p1.length + " * 6 = " + (p1.path[p1.length*6]));
      //console.log("p1.path[p1.length*6][0]: " + p1.path[p1.length*6][0]);
      
      p1.pos_list.push([p1.path[p1.length*6][0], p1.path[p1.length*6][1]]);
      p1.length += 1;
      if(g.foods.length < 10){
        addFood(g);
      }
    }
  }
}


//Function to convert key codes to direction strings
//Args: int keyCode
//Returns: string containing relevant direction
//if key is not a,w,s,d,up,down,left,right string will be empty
function keyToDir(keyCode){
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
function initSnakeDirection(){
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
//Returns an int 1,2,...10 since there are 10 skins right now
//Args: none
function initColor(){
  return Math.floor(Math.random() * Math.floor(10)) + 1
}


//Function to add a single food after one has been eaten
//Args: game object
//Returns: none
//Modifies: food list of game object
function addFood(g){
  let locationsNotValidated = true;
  while(locationsNotValidated){
    let fx = Math.floor(Math.random() * 628) + 6; //current board is 640px X 640px so
    let fy = Math.floor(Math.random() * 628) + 6; //place player randomly between 160px-480px
    let currFoodValid = true
    for(let i=0; i<g.foods.length; i++){
      if(check_overlap(fx, fy, g.foods[i].x, g.foods[i].y, 6,6)){//could be 5,5
        currFoodValid = false;
      }
    }
    for(let k in g.players){
      for(let i=0; i<g.players[k].pos_list.length; i++){
        if(check_overlap(fx, fy, g.players[k].pos_list[i].x, g.players[k].pos_list[i].y, 6,6)){
          currFoodValid = false;
        }
      }
    }
    if(currFoodValid){
      g.foods.push({x:fx, y:fy});
    }
    if(g.foods.length >= 10){
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
function initFoods(g){
  var arr = [];
  let locationsNotValidated = true;
  while(locationsNotValidated){
    let fx = Math.floor(Math.random() * 628) + 6; //current board is 640px X 640px so
    let fy = Math.floor(Math.random() * 628) + 6; //place player randomly between 160px-480px
    let currFoodValid = true
    for(let i=0; i<arr.length; i++){
      if(check_overlap(fx, fy, arr[i].x, arr[i].y, 6)){
        currFoodValid = false;
      }
    }
    if(currFoodValid){
      arr.push({x:fx, y:fy});
    }
    if(arr.length >= 10){
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
function initSnakeLocations(/*arr,*/ length, direction, g){
  var arr = [];
  let locationsNotValidated = true;
  while(locationsNotValidated){
    //generate length many locations specified direction
    let x = Math.floor(Math.random() * 320) + 160; //current board is 640px X 640px so
    let y = Math.floor(Math.random() * 320) + 160; //place player randomly between 160px-480px (not too close to edge)
    let tmp_arr = [];
    //console.log("head is " + x + " , " + y + " and dir is " + direction);
    tmp_arr.push([x,y]);
    let i;
    for(i=1; i<length; i++){
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
    if(g){//if game is intialized
      if(g.players.length > 1){//if its not the first player
        for(i=0; i<length; i++){//for each coord in tmp_arr
          for(let k in g.players){
            for(let j=0; j<g.players[k].pos_list.length; j++){//for each coord in each existing player
              if(check_overlap(g.players[k].pos_list[j][0], g.players[k].pos_list[j][1], tmp_arr[i][0], tmp_arr[i][1], 17,17)){
                validated = false;
                break;
              }
              if(!validated){break;}
            }
            if(!validated){break;}
          }
          if(!validated){break;}
        }
      }
    }
    
    //if all locations are valid, then save to exit loop, else generate new random locations
    if(validated){
      locationsNotValidated = false; //the locs are valid, loop will exit
      arr = tmp_arr;
    }
  }//end while
  //console.log("the REAL INITIAL pos_list is " + arr);
  return arr;
}

//Function to create initial path for snake's body segments
//Requires: snakes pos_list has been initialized
//Args: snake length, direction, pos_list of snake
//Returns: array of coords (a path the snake as traveled and which
//body segments must travel to follow the head)changed direction to
function initPath(length, dir, arr){
  var tmp_path = [];
  let i;
  //NOT +12 used to be +1 ... just seeing if it helps a bug to extend it
  let px_len = (length * 6) + 12; //should be 25 with 4 segment length
  //start by storing head in x,y and adding to path
  let x = arr[0][0];
  let y = arr[0][1];
  tmp_path.push([x,y]);
  for(i=1; i<px_len; i++){
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
    //theoretical assert(tmp_path.length == 25)
    return tmp_path;
}

//Function to move snake forward one unit
//Args: reference to game object
//Returns: none, changes made to referenced object
//Requires: game is initialized
//function moveSnakes(game){
function moveSnakes(){
    //arbitraily going to move the snake 1px...no clue how this will go
    for(var key in game.players) {
        if(!game.players[key].alive){continue;}
        let change_x = 0, change_y = 0;
        cur_dir = game.players[key].direction
        if(cur_dir == 'up'){//up
            change_y = -1 * game.players[key].velocity;
        }else if(cur_dir == 'right'){//right
            change_x = 1 * game.players[key].velocity;
        }else if(cur_dir == 'down'){//down
            change_y = 1 * game.players[key].velocity;
        }else{//left
            change_x = -1 * game.players[key].velocity;
        }
        
        //move head of snake
        game.players[key].pos_list[0][0] += change_x;
        game.players[key].pos_list[0][1] += change_y;

        //push new loc to front of path queue and all points in between in velocity
        if(cur_dir == 'up'){//up
          for(let i = game.players[key].velocity - 1; i >= 0; i--){
            game.players[key].path.unshift([game.players[key].pos_list[0][0],game.players[key].pos_list[0][1]+i]);
          }
        }else if(cur_dir == 'right'){//right
          for(let i = game.players[key].velocity - 1; i >= 0; i--){
            game.players[key].path.unshift([game.players[key].pos_list[0][0]-i,game.players[key].pos_list[0][1]]);
          }
        }else if(cur_dir == 'down'){//down
          for(let i = game.players[key].velocity - 1; i >= 0; i--){
            game.players[key].path.unshift([game.players[key].pos_list[0][0],game.players[key].pos_list[0][1]-i]);
          }
        }else{//left
          for(let i = game.players[key].velocity - 1; i >= 0; i--){
            game.players[key].path.unshift([game.players[key].pos_list[0][0]+i,game.players[key].pos_list[0][1]]);
          }
        }

        //loop through segment coords and get new coord off path
        for(let i=1; i < game.players[key].length; i++){
            game.players[key].pos_list[i][0] = game.players[key].path[i*6][0];
            game.players[key].pos_list[i][1] = game.players[key].path[i*6][1];
        }

        while(game.players[key].path.length > game.players[key].path_len){//was if
          //we dont need to store extra coords until another segment is add
          //which means we have enough room to add a segment if needed
          game.players[key].path.pop();//so pop last value
        }
    }
}

//function to adjust the boost levels of all players
function updateBoosts(){
  for(var key in game.players) {
    if(game.players[key].boosting){
      //decrease boost meter
      game.players[key].boost_level -= 1;//WAS 0.25 but testing with 1
    }else{
      //increase boos meter
      game.players[key].boost_level += 0.5;
    }
    //console.log("boost level is " + game.players[key].boost_level)
    if(game.players[key].boost_level > game.players[key].boost_cap){
      game.players[key].boost_level = game.players[key].boost_cap;
    }
    if(game.players[key].boost_level < 0){
      game.players[key].boost_level = 0;
    }
    //adjust velocity based on input and boost meter
    if(game.players[key].boosting && game.players[key].boost_level > 0){
      game.players[key].velocity = 5;
    }else{
      game.players[key].velocity = 2;
    }
  }

}


///////////////////////Game Object Creation////////////////////////////////////
var game = {
    players: {},
    foods: [],
    board: {x: 640, y: 640}
};

initFoods(game);

//var game_serv = {};

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



//attempting to write game loop in a setInterval func...
//setInterval(function(inputQueue, game){
setInterval(function(){
  //console.log("in the udpate loop" + " the counter is " + update_count);
    //NOTE: node is not multithreaded so the queue is safe within the scope of this function
    //console.log("game: " + game.toString());
    if(game){
      //console.log("game is set");

         //1. UPDATE PLAYER DIRECTIONS BASED ON INPUTS
        let i;
        let len = 0;
        if(game.players){
            len = inputQueue.length;
        }
        for(i = 0; i < len; i++){
          //console.log("we must have had an input");
            let input = inputQueue.pop();//input is [socket.id, key_code]
            //process each input
            //if input toggles boost:
            if (input[1] == true || input[1] == false){
              //console.log("WE HAVE A T/F input");
              if(input[0] in game.players){
                if(game.players[input[0]].alive){
                  game.players[input[0]].boosting = input[1];
                }
              }
              //CHANGING VELOCITY OF PLAYER TEMPORARILY WITHOUT CONSIDER BOOST METER
              //if(game.players[input[0]].boosting){
                //game.players[input[0]].velocity = 5;
              //}else{
                //game.players[input[0]].velocity = 2;
              //}

            }else{//input changes direction
              if(input[0] in game.players){
                if(game.players[input[0]].alive){
                  game.players[input[0]].direction = keyToDir(input[1]);
                }
              }
            }
        }

        //1.5 UPDATE BOOST METERS AND VELOCITY
        updateBoosts();
        //2. UPDATE PLAYER LOCATIONS BASED ON DIRECTION
        //moveSnakes(game);
        moveSnakes();

        //3. UPDATE PLAYERS BASED ON GAME EVENTS (check various types of collisions)
        //change score, aliveness, length, food locations
        for(let id in game.players){
          checkGameEvents(game.players[id], game);
        }
        for(let id in game.players){//separating deletes... they only happen here now
          if(!game.players[id].alive){
            delete game.players[id];
          }
        }

        //THIS IS IMPORTANT But i want to speed it up w/o breaking stuff, temporarily moving emit out of if
        io.sockets.emit('authoritativeUpdate', game);
        update_count++;//we want three updates per emit so heres where we track it
        if(update_count == 3){
            //emit new current authoritative gamestate (by sending entire game object?)
            //io.sockets.emit('authoritativeUpdate', game);
            update_count = 0;
        }
        
        //DEBUG CODE
        for(let key in game.players){
          //console.log("player name: " + game.players[key].name + " has a length of " + game.players[key].length);
          //console.log("their path_len is " + game.players[key].paht_len + " their path has a len " + game.players[key].path.length);
        }
        if (game.foods){
        //console.log("last two food locs are: ( "+ game.foods[game.foods.length - 1].x +" , " + game.foods[game.foods.length - 1].y + " ) ( "+ game.foods[game.foods.length - 2].x +" , " + game.foods[game.foods.length - 2].y + " )");
        }//END DEBUG CODE
    } 

}, 1000/15);// call func every 15 ms


//ALL SERVER EVENT LISTENERS ARE CALLED ON CONNECTION WITHIN THIS FUNCTION
io.on('connection', function (socket) {


	//var game_server = require('./public/js/game_server.js');
	//game_serv = new game_server();


  	console.log('a user connected with socket id: ' + socket.id );
    //let the player know what its ID is in the game obj
    io.sockets.emit('passID', socket.id);

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
      velocity: 2, //originally was 1... 2 might be ideal if boost was implemented
      //Here color will be a random int, and there are 3 colors on the sprite sheet
      color: initColor(),
      alive: true,
      path: snakePath,
      path_len: (snakeLen*6) + 12, //WAS + 1, now its +11 to add some extra breathing room 
      boost_level: 100, //double
      boost_cap: 100,
      boosting: false
  	};

  	socket.on('initPlayer', function(data){//initPlayer emitted after player recieves CONNACK
  		//change name in player object
  		game.players[socket.id].name = data.playerName;//data.playerName is incomeing info from client

      //logs for testing:
  		//console.log('player name, ' + data.playerName + ' recieved from ' + socket.id +', updating player object');
  		console.log('Player ' + socket.id + ' name updated to ' + game.players[socket.id].name);
      console.log('length: ' + game.players[socket.id].length + ' path_len: ' + game.players[socket.id].path_len);
      console.log('length of pos list: ' +game.players[socket.id].pos_list.length+ ' length of path array: ' +game.players[socket.id].path.length);
		  //console.log(game.players[socket.id].name + "'s initial direction is: " + game.players[socket.id].direction );
		  //console.log(game.players[socket.id].name, "location array is:", game.players[socket.id].pos_list);

  	});

  	//update all other players of the new player
  	//socket.broadcast.emit('newPlayer', players[socket.id]);

  	//when the client emits a 'playerMovement' msg we catch the data here
  	socket.on('playerMovement', function(data){
  		//naive implementation would just send updated gamestate to all players right here
      //test code:
        if(game.players[socket.id]){
        //console.log('player', socket.id, 'changed direction to', data.input);
        io.sockets.emit('gameStateUpdate', game.players[socket.id].name + "'s direction changed...");

        inputQueue.unshift([socket.id, data.input]);//data.input is a number (key code)
      }
  		

		// Send message to game server
		//game_serv.message("playerMovement", data);

  	});

    socket.on('playerBoost', function(data){
      //console.log("BOOST MSG RECIEVED");
      inputQueue.unshift([socket.id, data.input]);//data.input is bool, true/false
    });

  	//send the players object to the new player
  	//socket.emit('currentPlayers', players);

  	socket.on('disconnect', function () {
    	console.log('user '+ socket.id +' disconnected');
    	//remove this player from our players object
    	delete game.players[socket.id];
    	io.emit('disconnect', socket.id);
  	});

});

server.listen(8081, function () {
  	console.log(`Listening on ${server.address().port}`);
});
