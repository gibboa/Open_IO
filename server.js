var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

//players object contains the state of all connected players
//(will be set up like a python dictionary of dictionaries)
//maps socket.id to the dictionary-like collection:
//string direction --> left, right, up, or down
//int x --> x position in pixels
//int y --> y position in pixels
//int playerId --> the socket.id of player
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
    	x: Math.floor(Math.random() * 320) + 160, 
    	y: Math.floor(Math.random() * 320) + 160, //place player randomly between 160px-480px (not too close to edge)
    	playerId: socket.id,
    	//we would have name data from client but dont know how to get it to the server yet
  	};

  	// update all other players of the new player
  	socket.broadcast.emit('newPlayer', players[socket.id]);

  	// send the players object to the new player
  	socket.emit('currentPlayers', players);
  
  	socket.on('disconnect', function () {
    	console.log('user '+ socket.id +' disconnected');
    	// remove this player from our players object
    	delete players[socket.id];
    	io.emit('disconnect', socket.id);
  	});
  
});

server.listen(8081, function () {
  	console.log(`Listening on ${server.address().port}`);
});