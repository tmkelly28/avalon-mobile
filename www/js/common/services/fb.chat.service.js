'use strict';

app.service('FbChatService', function ($firebaseArray) {

	this.fetchById = function (id) {
		let fb = new Firebase("https://resplendent-torch-2655.firebaseio.com/chat/" + id);
		return $firebaseArray(fb);
	}

	this.addChat = function (fbArray, author, text) {
		fbArray.$add({
            sender: author.displayName,
			text: text,
            senderPicture: author.picture
		});
	}

});
