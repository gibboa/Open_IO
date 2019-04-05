var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

//players object contains the state of all connected players
//maps socket.id to the dictionary-structy-like collection:
//string direction --> left, right, up, or down
//int x --> x position in pixels
//int y --> y position in pixels
//int playerId --> the socket.id of player
//string name --> name of player entered at game start
//access by typing 'players[socket.id].direction'
var players = {};
 
app.use(express.static(__dirname + '/public'));
 
app.get('/', function (req, res) {
  	res.sendFile(__dirname + '/public/proto_index.html');
});

io.on('connection', function (socket) {
  	console.log('a user connected with socket id: ' + socket.id );
  	//map user's socket id to a player object initialized with random values

  	players[socket.id] = {
    	direction: 'left', //LATER: add code to make it a random cardinal direction
    	//Math.floor(Math.random() * Math.floor(max)), that will return a random number (0,max]
    	x: Math.floor(Math.random() * 320) + 160, //current board is 640px X 640px so
    	y: Math.floor(Math.random() * 320) + 160, //place player randomly between 160px-480px (not too close to edge)
    	playerId: socket.id,
    	name: 'Guest' //changes on connection via 'initPlayer' message
  	};

  	socket.on('initPlayer', function(data){
  		//change name in player object
  		players[socket.id].name = data.playerName;
  		console.log('player name, ' + data.playerName + ' recieved from ' + socket.id +', updating player object');
  		console.log('Player ' + socket.id + ' name updated to ' + players[socket.id].name);

  	});

  	//update all other players of the new player
  	//socket.broadcast.emit('newPlayer', players[socket.id]);

  	//when the client emits a 'playerMovement' msg we catch the data here
  	socket.on('playerMovement', function(data){
  		//upon receit, process data, and send new positions to all clients
  		//NOTE: this isnt actually movement related yet, i just want to send data
  		console.log('player', socket.id, 'changed direction to', data.input);
  		io.sockets.emit('gameStateUpdate', players[socket.id].name + "'s direction changed...");
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