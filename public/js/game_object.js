

// Our main game object that will handle most aspects of the game
var game_object = function(instance) {
	
	this.server = false;
	
	if (instance !== undefined) {
		this.server = true;
	}
	
	this.board = {
		hieght : 640,
		width : 640
	};
}

game_object.update = function(time) {
	
	
}

//module.exports = global.game_object = game_object;