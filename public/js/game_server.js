
var game_server = function() {
	
	this.players = {};
	//this.game_object = new game_object( game_server );
};



//var gane_object = require('./game_object.js');



game_server.emit = function(s) {
	console.log(s);
	
}

game_server.log_player = function(id) {
	
};

game_server.message = function(type, data) {
	console.log(__dirname);
	
}