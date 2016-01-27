'use strict';

app.service('UserService', function ($http) {

	function toData (res) {
		return res.data;
	}

	function errorHandler (error) {
		console.error(error);
	}

	this.fetchById = function (id) {
		return $http.get('/api/users/' + id)
    		.then(toData)
    		.then(null, errorHandler);
	}

	this.update = function (id, data) {
		return $http.put('/api/users/' + id, data)
    		.then(toData)
    		.then(null, errorHandler);
	}

	this.fetchStatistics = function (id) {
		return $http.get('/api/users/' + id +'/statistics')
    		.then(toData)
    		.then(null, errorHandler);
	}

	this.updateStatistics = function (player, winner, guessedMerlin) {
		return $http.put('/api/users/' + player._id +'/statistics', {
			character: player.character,
			loyalty: player.loyalty,
			winner: winner,
			guessedMerlin: guessedMerlin
		})
    		.then(toData)
    		.then(null, errorHandler);
	}

});
