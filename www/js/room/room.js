'use strict';

app.config($stateProvider => {

	$stateProvider.state('room', {
		url: '/room/:key',
		templateUrl: 'js/room/room.html',
		controller: 'RoomCtrl',
		data: {
			authenticate: true
		},
		resolve: {
			game: ($stateParams, FbGamesService) => FbGamesService.fetchById($stateParams.key),
			chats: ($stateParams, FbChatService) => FbChatService.fetchById($stateParams.key),
			user: (UserService, Session, FbGamesService, $stateParams) => {
				return UserService.fetchById(Session.user._id)
				    .then(user => FbGamesService.fetchPlayer($stateParams.key, user.playerKey));
			},
			userRecord: (UserService, Session) => UserService.fetchById(Session.user._id),
			players: ($stateParams, FbGamesService) => FbGamesService.fetchPlayers($stateParams.key)
		}
	});
});

app.controller('RoomCtrl', ($scope, game, chats, user, players, userRecord, Session, FbChatService, FbGamesService, FbListeners) => {

	$scope.game = game;
	$scope.chats = chats;
	$scope.user = user;
	$scope.userRecord = userRecord;
	$scope.players = players;
	$scope.myTurn = false;
	$scope.investigatedPlayer = null;
    $scope.display = 'chat';

	FbListeners.registerListeners($scope.game, $scope.userRecord, $scope);

    $scope.toggle = (state) => $scope.display = state;
	$scope.addMessage = (message) => {
		if (!message.text) return;
		FbChatService.addChat($scope.chats, Session.user, message.text);
	};
	$scope.isHost = () => Session.user._id === $scope.game.host;
	$scope.ableToBegin = () => {
		let numberOfPlayers = Object.keys($scope.game.players).length;
		return numberOfPlayers >= $scope.game.targetSize && numberOfPlayers < 11;
	};
	$scope.startGame = () => FbGamesService.startGame($scope.game);
	$scope.me = (player) => player._id === $scope.user._id;
	$scope.voteApprove = () => FbGamesService.approveTeam($scope.game.$id, $scope.userRecord.playerKey);
	$scope.voteReject = () => FbGamesService.rejectTeam($scope.game.$id, $scope.userRecord.playerKey);
	$scope.successQuest = () => FbGamesService.voteToSucceed($scope.game.$id, $scope.userRecord.playerKey);
	$scope.failQuest = () => FbGamesService.voteToFail($scope.game.$id, $scope.userRecord.playerKey);
	$scope.addToTeam = (player) => FbGamesService.addToTeam($scope.game.$id, player);
	$scope.proposeTeam = () => FbGamesService.proposeTeam($scope.game.$id);
	$scope.resetTeam = () => FbGamesService.resetTeam($scope.game.$id);
	$scope.guessMerlin = (player) => FbGamesService.guessMerlin($scope.game.$id, player);
	$scope.disablePropose = () => {
		if (!$scope.game.currentQuestPlayersGoing) return true;
		else return $scope.game.currentQuestPlayersNeeded !== Object.keys($scope.game.currentQuestPlayersGoing).length;
	};
	$scope.range = (n, m) => _.range(n, m);
	$scope.useLady = (player) => {
		// this won't persist after refresh
		$scope.investigatedPlayer = {
			loyalty: player.loyalty,
			displayName: player.displayName
		}
		FbGamesService.useLady($scope.game.$id, player);
	};
});
