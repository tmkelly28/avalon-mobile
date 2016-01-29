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

    function _removeById (idArray, id) {
        let idx = idArray.indexOf(id);
        idx > -1 ? idArray.splice(idx, 1) : null;
    }

	$scope.game = game;
	$scope.chats = chats;
	$scope.user = user;
	$scope.userRecord = userRecord;
	$scope.players = players;
	$scope.myTurn = false;
	$scope.investigatedPlayer = null;
    $scope.selected = [];

	FbListeners.registerListeners($scope.game, $scope.userRecord, $scope);

	$scope.addMessage = (message) => message.text ? FbChatService.addChat($scope.chats, Session.user, message.text) : null;
	$scope.isHost = () => Session.user._id === $scope.game.host;
	$scope.ableToBegin = () => Object.keys($scope.game.players).length >= $scope.game.targetSize && Object.keys($scope.game.players).length < 11;
	$scope.startGame = () => FbGamesService.startGame($scope.game);
	$scope.me = (player) => player._id === $scope.user._id;
	$scope.addToTeam = (player) => FbGamesService.addToTeam($scope.game.$id, player);
	$scope.proposeTeam = () => FbGamesService.proposeTeam($scope.game.$id);
	$scope.disablePropose = () => !$scope.game.currentQuestPlayersGoing ? true : $scope.game.currentQuestPlayersNeeded !== Object.keys($scope.game.currentQuestPlayersGoing).length;
    $scope.resetTeam = () => FbGamesService.resetTeam($scope.game.$id);
    $scope.voteApprove = () => FbGamesService.approveTeam($scope.game.$id, $scope.userRecord.playerKey);
    $scope.voteReject = () => FbGamesService.rejectTeam($scope.game.$id, $scope.userRecord.playerKey);
    $scope.successQuest = () => FbGamesService.voteToSucceed($scope.game.$id, $scope.userRecord.playerKey);
    $scope.failQuest = () => FbGamesService.voteToFail($scope.game.$id, $scope.userRecord.playerKey);
    $scope.guessMerlin = (player) => FbGamesService.guessMerlin($scope.game.$id, player);
	$scope.range = (n, m) => _.range(n, m);
	$scope.useLady = (player) => {
		// this won't persist after refresh
		$scope.investigatedPlayer = {
			loyalty: player.loyalty,
			displayName: player.displayName
		}
		FbGamesService.useLady($scope.game.$id, player);
	};
    $scope.isSelected = (id) => $scope.selected.includes(id);
    $scope.select = (id) => $scope.isSelected(id) ? _removeById($scope.selected, id) : $scope.selected.push(id);
    $scope.delegate = (player, evt) => {
        // maybe add this to an array on scope and add the class using ng class instead
        if (![].slice.call(evt.target.classList).includes('selected')) {
            evt.target.classList.add('selected');
            return;
        } else {
            if ($scope.myTurn &&
                $scope.game.roomLeftOnTeam &&
                $scope.game.currentGamePhase === 'team building' &&
                !player.onQuest) $scope.addToTeam(player);
            else if ($scope.user.character === 'Assassin' &&
                $scope.game.currentGamePhase === 'guess merlin' &&
                (player.loyalty === 'good' || player.character === 'Oberon')) $scope.guessMerlin(player);
            else if ($scope.user._id === $scope.game.currentLadyOfTheLake._id &&
                $scope.game.currentGamePhase === 'using lady' &&
                player.hasBeenLadyOfTheLake &&
                player._id !== $scope.user._id) $scope.useLady(player);
            else evt.target.classList.remove('selected')
        }
    }
});
