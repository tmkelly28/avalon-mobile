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

    function _remove (playerArray, player) {
        let idx = _.findIndex(playerArray, { _id: player._id });
        idx > -1 ? playerArray.splice(idx, 1) : null;
    }

    function _has (playerArray, player) {
        return _.findIndex(playerArray, { _id: player._id }) > -1;
    }

	const addToTeam = (player) => FbGamesService.addToTeam($scope.game.$id, player);

    $scope.game = game; // Object
    $scope.chats = chats; // Object[]
    $scope.user = user; // Object
    $scope.userRecord = userRecord; // Object
    $scope.players = players; // Object[]
    $scope.myTurn = false; // boolean
    $scope.investigatedPlayer = null; // Object
    $scope.selected = []; // Object[]

    FbListeners.registerListeners($scope.game, $scope.userRecord, $scope);

    $scope.addMessage = (message) => message.text ? FbChatService.addChat($scope.chats, Session.user, message.text) : null;
    $scope.isHost = () => Session.user._id === $scope.game.host;
    $scope.ableToBegin = () => Object.keys($scope.game.players).length >= $scope.game.targetSize && Object.keys($scope.game.players).length < 11;
    $scope.startGame = () => FbGamesService.startGame($scope.game);
    $scope.me = (player) => player._id === $scope.user._id;
	$scope.proposeTeam = () => {
        return Promise.all($scope.selected.map(playerId => addToTeam(playerId)))
            .then(() => {
                $scope.selected = [];
                FbGamesService.proposeTeam($scope.game.$id)
            });
    };
	$scope.disablePropose = () => $scope.selected.length !== $scope.game.currentQuestPlayersNeeded;
    $scope.resetTeam = () => {
        $scope.selected = [];
        FbGamesService.resetTeam($scope.game.$id)
    };
    $scope.voteApprove = () => FbGamesService.approveTeam($scope.game.$id, $scope.userRecord.playerKey);
    $scope.voteReject = () => FbGamesService.rejectTeam($scope.game.$id, $scope.userRecord.playerKey);
    $scope.successQuest = () => FbGamesService.voteToSucceed($scope.game.$id, $scope.userRecord.playerKey);
    $scope.failQuest = () => FbGamesService.voteToFail($scope.game.$id, $scope.userRecord.playerKey);
    $scope.guessMerlin = (player) => FbGamesService.guessMerlin($scope.game.$id, player);
	$scope.range = (n, m) => _.range(n, m);
    $scope.disableLady = () => {
        if ($scope.selected.length !== 1) return true;
        if ($scope.selected.length === 1) {
            let player = $scope.selected[0];
            if (player.hasBeenLadyOfTheLake || player._id === user._id) return true;
        }
        return false;
    };
	$scope.useLady = () => {
        let player = $scope.selected[0];
        $scope.selected = [];
		// this won't persist after refresh
		$scope.investigatedPlayer = {
			loyalty: player.loyalty,
			displayName: player.displayName
		}
		FbGamesService.useLady($scope.game.$id, player);
	};
    $scope.isSelected = (player) => _has($scope.selected, player);
    $scope.select = (player) => $scope.isSelected(player) ? _remove($scope.selected, player) : $scope.selected.push(player);
    $scope.revealPicture = (player) => {
        if (player.onQuest && $scope.game.currentGamePhase === 'team voting') return '/img/sigil.png';
        if (player.approvedQuest && $scope.game.currentGamePhase === 'quest voting') return '/img/approve.png';
        if (!player.approvedQuest && $scope.game.currentGamePhase === 'quest voting') return '/img/reject.png';
        if (game.currentLadyOfTheLake._id === player._id) return '/img/lady_of_the_lake.png';
        if ($scope.me(player) ||
            ($scope.game.currentGamePhase.slice(0, 3) === 'end') ||
            ($scope.game.currentGamePhase === 'guess merlin' &&
                player.loyalty === 'evil' &&
                player.character !== 'Oberon')) return player.imageUrl;
        return player.picture;
    }

});
