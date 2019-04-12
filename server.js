var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);


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

//players object contains the state of all connected players
//maps socket.id to the dictionary-structy-like collection:
//described in more detail in GameStructures.txt in repo
var players = {};

var game_serv = {};

app.use(express.static(__dirname + '/public'));
 
app.get('/', function (req, res) {
  	res.sendFile(__dirname + '/public/proto_index.html');
});

io.on('connection', function (socket) {
	
	
	//var game_server = require('./public/js/game_server.js');
	//game_serv = new game_server();
	
	
  	console.log('a user connected with socket id: ' + socket.id );
    //on connections generate a random snake for new player
    
    snakeLen = 4;//set initial length to whatever we want
    
    //building intital array of snake locations
    
    //first pick a direction at random:
    var snakeDir = initSnakeDirection();
    
    var snakeLocs = initSnakeLocations(snakeLen, snakeDir);
    
  	players[socket.id] = {
      pos_list: snakeLocs,
    	playerId: socket.id,
    	name: 'Guest', //changes on connection via 'initPlayer' message
      direction: snakeDir, 
      length: snakeLen,
      score: 0,
      velocity: 1, //dont know what to put for this yet
      //Here color will be a random int, and there are 3 colors on the sprite sheet
      color: Math.floor(Math.random() * Math.floor(3)), //0,1,or 2... can change how we do this
      status: 'alive'
  	};

  	socket.on('initPlayer', function(data){
  		//change name in player object
  		players[socket.id].name = data.playerName;//data.playerName is incomeing info from client
      //logs for testing:
  		console.log('player name, ' + data.playerName + ' recieved from ' + socket.id +', updating player object');

  		console.log('Player ' + socket.id + ' name updated to ' + players[socket.id].name);
		console.log(players[socket.id].name + "'s initial direction is: " + players[socket.id].direction );
		console.log(players[socket.id].name, "location array is:", players[socket.id].pos_list);

  	});

  	//update all other players of the new player
  	//socket.broadcast.emit('newPlayer', players[socket.id]);

  	//when the client emits a 'playerMovement' msg we catch the data here
  	socket.on('playerMovement', function(data){
  		//upon receit, process data, and send new positions to all clients
  		//NOTE: this isnt actually movement related yet, i just want to send data
  		console.log('player', socket.id, 'changed direction to', data.input);
  		io.sockets.emit('gameStateUpdate', players[socket.id].name + "'s direction changed...");
		
		// Send message to game server
		//game_serv.message("playerMovement", data);
		
  	});

  	//send the players object to the new player
  	//socket.emit('currentPlayers', players);
  
  	socket.on('disconnect', function () {
    	console.log('user '+ socket.id +' disconnected');
    	//remove this player from our players object
    	delete players[socket.id];
    	io.emit('disconnect', socket.id);
  	});
  
});

server.listen(8081, function () {
  	console.log(`Listening on ${server.address().port}`);
});