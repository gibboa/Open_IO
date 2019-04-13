var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

//Function to convert key codes to direction strings
//Args: int keyCode
//Returns: string containing relevant direction
//if key is not a,w,s,d,up,down,left,right string will be empty
function keyToDir(keyCode){
//keyCode Reference for likely keys:
//'w'=87, 'a'=65, 's'=83, 'd'=68, SHIFT=16, SPACE=32, 'e'=69, 'q'=81
//UP=38, DOWN=40, LEFT=37, RIGHT=39, ENTER=13
    switch (key_code) {
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
function initSnakeLocations(/*arr,*/ length, direction/*, playersObj*/){
  var arr = [];
  let locationsNotValidated = true;
  while(locationsNotValidated){
    //generate length many locations specified direction
    let x = Math.floor(Math.random() * 320) + 160; //current board is 640px X 640px so
    let y = Math.floor(Math.random() * 320) + 160; //place player randomly between 160px-480px (not too close to edge)
    let tmp_arr = [];
    tmp_arr.push([x,y]);
    let i;
    for(i=1; i<length; i++){
      //generating points points based on direction, points are 5 px apart
      let offset = i*5;
      switch (direction) {
        case 'up': tmp_arr.push( [ x, (y+offset) ] ); break;
        case 'right': tmp_arr.push( [ (x-offset), y ] ); break;
        case 'down': tmp_arr.push( [ x, (y-offset) ] ); break;
        case 'left': tmp_arr.push( [ (x+offset), y ] ); break;   
      }
    }
    //call collision detection on each location
    let validated = true;
    for(i=0; i<length; i++){
      //LEAVING IT OUT FOR NOW but for each point in tmp_arr check that its not on top of another snake
      //also we need to consider speed and timing... this collision detection will likely need to look for wide
      //open spaces so that new snakes dont die instantly and old snakes dont have new snakes spawning
      //in front of them out of nowhere... would kinda ruin the game
      //detectCollision(tmp_arr[i][0], tmp_arr[i][1], playersObj); ... or wutever
      //if any location fails, then validated will be turned to valse
    }
    //if all locations are valid, then save to exit loop, else generate new random locations
    if(validated){
      locationsNotValidated = false; //the locs are valid, loop will exit
      arr = tmp_arr;
    }
  }//end while
  return arr;
}

//Function to move snake forward one unit
//Args: reference to game object
//Returns: none, changes made to referenced object
//Requires: game is initialized
function moveSnakes(game){
    //arbitraily going to move the snake 1px...no clue how this will go
    for(var key in game.players) {
        let change_x = 0, change_y = 0;
        cur_dir = game.players[key].direction
        if(cur_dir == 'up'){//up
            change_y = -1;
        }else if(cur_dir == 'right'){//right
            change_x = 1;
        }else if(cur_dir == 'down'){//down
            change_y = 1;
        }else{//left
            change_x = -1;
        }
        //this is where i WOULD loop through each segment position and change it but....
        //for(let i=0; i < game.players[key].pos_list.length; i++){
          //some thoughts on how to get the snake segments to follow the path of the head
          //maybe save the position whenever there is a change in direction and until you reach
          //that position, you dont change direction (every segment needs a direction)
          //OK HERES THE PLAN
          //currently position list is [[x,y]]
          //it will become [[x,y,curr_direction, new_direction_set-->true/false, new_direction, turn_at_x, turn_at_y]]
          //so if pos_list[3] is false, we dont need to worry about turning the snake
          //1. whenever a snake turns, the turn propagates down the body,
          //   so when the head turns, pass data to the segment behind it
          //   pos_list[3] = true, pos_list[4] = direction curr segment is turning to
          //   pos_list[5] = x coord where next turn takes place, pos_list[6] = y coord of next turn
          //2. before moving a segment, IF pos_list[3]==true AND curr position x,y == turn_at x,y
          //   THEN change the curr direction of segment to new_direction
          //3. propagate turn back following segment if one exists
          //3. move segment in curr direction which was just updated from the old one... 
        //}
        game.players[key].pos_list[0][0] += change_x;
        game.players[key].pos_list[0][1] += change_y;
    }
}


///////////////////////Game Object Creation////////////////////////////////////
var game = {
    players: {},
    foods: [],
    board: {x: 640, y: 640} 
};
//players object contains the state of all connected players
//maps socket.id to the dictionary-structy-like collection:
//described in more detail in GameStructures.txt in repo
//var players = {};

var game_serv = {};

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
setInterval(function(inputQueue, game){
    //NOTE: node is not multithreaded so the queue is safe within the scope of this function
    
    //1. UPDATE PLAYER DIRECTIONS BASED ON INPUTS
    let i;
    let len = inputQueue.length;
    for(i = 0; i < len; i++){
        let input = inputQueue.pop();//input is [socket.id, key_code]
        //process each input (only inputs are direction changes right now)
        game.players[input[0]].direction = keyToDir(input[1]);
    }

    //2. UPDATE PLAYER LOCATIONS BASED ON DIRECTION
    moveSnakes(game);

    //3. UPDATE PLAYERS BASED ON GAME EVENTS (check various types of collisions)
    //change score, aliveness, length, food locations

    update_count++;//we want three updates per emit so heres where we track it
    if(update_count == 3){
        //emit new current authoritative gamestate (by sending entire game object?)
        io.sockets.emit('authoritativeUpdate', game);
        update_count = 0;
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
    
    //building intital array of snake locations
    
    //first pick a direction at random:
    var snakeDir = initSnakeDirection();
    
    var snakeLocs = initSnakeLocations(snakeLen, snakeDir);
    
  	game.players[socket.id] = {
      pos_list: snakeLocs,
    	playerId: socket.id,
    	name: 'Guest', //changes on connection via 'initPlayer' message
      direction: snakeDir, 
      length: snakeLen,
      score: 0,
      velocity: 1, //dont know what to put for this yet
      //Here color will be a random int, and there are 3 colors on the sprite sheet
      color: Math.floor(Math.random() * Math.floor(3)), //0,1,or 2... can change how we do this
      status: true
  	};

  	socket.on('initPlayer', function(data){//initPlayer emitted after player recieves CONNACK
  		//change name in player object
  		game.players[socket.id].name = data.playerName;//data.playerName is incomeing info from client
      
      //logs for testing:
  		console.log('player name, ' + data.playerName + ' recieved from ' + socket.id +', updating player object');
  		console.log('Player ' + socket.id + ' name updated to ' + game.players[socket.id].name);
		  console.log(game.players[socket.id].name + "'s initial direction is: " + game.players[socket.id].direction );
		  console.log(game.players[socket.id].name, "location array is:", game.players[socket.id].pos_list);

  	});

  	//update all other players of the new player
  	//socket.broadcast.emit('newPlayer', players[socket.id]);

  	//when the client emits a 'playerMovement' msg we catch the data here
  	socket.on('playerMovement', function(data){
  		//naive implementation would just send updated gamestate to all players right here
      //test code:
  		//console.log('player', socket.id, 'changed direction to', data.input);
  		//io.sockets.emit('gameStateUpdate', game.players[socket.id].name + "'s direction changed...");
		
      inputQueue.unshift([socket.id, data.input]);//data.input is a number (key code)

		// Send message to game server
		//game_serv.message("playerMovement", data);
		
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