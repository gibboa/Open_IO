

// Our main game object that will handle most aspects of the game
var game_object = function(instance) {
	
	this.server = (instance !== undefined);
	this.players = {};
	
	//if (instance !== undefined) {
	//	this.server = true;
	//}
	
	this.board = {
		height : 640,
		width : 640
	};
}

game_object.prototype.update = function(time) {
	
	if (this.server) {
		this.server_update();
	} else {
		this.client_update();
	}
}

game_object.prototype.server_update = function() {
	
}

game_object.prototype.client_update = function() {
	console.log("Client up");
}

//module.exports = global.game_object = game_object;