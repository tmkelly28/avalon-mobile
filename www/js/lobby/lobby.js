'use strict';

app.config($stateProvider => {

	$stateProvider.state('lobby', {
		url: '/lobby/:uid',
		templateUrl: '/js/lobby/lobby.html',
		controller: 'LobbyCtrl',
		data: {
			authenticate: true
		},
		resolve: {
			user: ($stateParams, UserService) => UserService.fetchById($stateParams.uid),
			games: (FbGamesService) => FbGamesService.fetchAllGames()
		}
	});
});

app.controller('LobbyCtrl', ($scope, $state, user, games) => {

	$scope.user = user;
	$scope.games = games;

	$scope.specialRules = game => {
		let rules = [];
		if (game.useMordred) rules.push('Mordred');
		if (game.usePercival) rules.push('Percival');
		if (game.useMorgana) rules.push('Morgana');
		if (game.useOberon) rules.push('Oberon');
		if (game.useLady) rules.push('Lady of the Lake');
		return rules.join(' | ');
	}

	$scope.numberOfPlayers = (game) => game.players ? Object.keys(game.players).length : 1;
});
