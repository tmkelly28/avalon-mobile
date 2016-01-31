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

app.controller('RoomCtrl', ($scope, game, chats, user, players, userRecord, Session, FbChatService, FbGamesService, FirebaseEvents) => {

    function _remove (playerArray, player) {
        let idx = _.findIndex(playerArray, { _id: player._id });
        idx > -1 ? playerArray.splice(idx, 1) : null;
    }

    function _has (playerArray, player) {
        return _.findIndex(playerArray, { _id: player._id }) > -1;
    }

    function _notFirstTeamProposalOfQuest () {
        return game.currentGamePhase === 'team building' && game.currentQuestIdx !== 0 && game.currentVoteTrack !== 0;
    }

	const addToTeam = (player) => FbGamesService.addToTeam($scope.game.$id, player);

    $scope.game = game;
    $scope.chats = chats;
    $scope.user = user;
    $scope.userRecord = userRecord;
    $scope.players = players;
    $scope.myTurn = false;
    $scope.investigatedPlayer = null;
    $scope.selected = [];
    $scope.gameStartModal = $scope.ladyModal = $scope.questResultModal = null;

    FirebaseEvents.registerListeners($scope.game, $scope.userRecord, $scope);

    $scope.closeGameStartModal = () => $scope.gameStartModal.hide().then(() => $scope.gameStartModal.remove());
    $scope.closeLadyModal = () => $scope.ladyModal.hide().then(() => $scope.ladyModal.remove());
    $scope.closeQuestResultModal = () => $scope.questResultModal.hide().then(() => $scope.questResultModal.remove());

    $scope.addMessage = (message) => message.text ? FbChatService.addChat($scope.chats, Session.user, message.text) : null;
    $scope.isHost = () => Session.user._id === $scope.game.host;
    $scope.ableToBegin = () => Object.keys($scope.game.players).length >= $scope.game.targetSize && Object.keys($scope.game.players).length < 11;
    $scope.startGame = () => FbGamesService.startGame($scope.game);
    $scope.me = (player) => player._id === $scope.user._id;
	$scope.proposeTeam = () => {
        return Promise.all($scope.selected.map(playerId => addToTeam(playerId)))
            .then(() => {
                $scope.selected = [];
                FbGamesService.proposeTeam($scope.game.$id);
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
    $scope.guessMerlin = () => {
        let _player = $scope.selected[0];
        $scope.selected = [];
        FbGamesService.guessMerlin($scope.game.$id, _player);
    };
	$scope.range = (n, m) => _.range(n, m);
    $scope.disableLady = () => {
        if ($scope.selected.length !== 1) return true;
        if ($scope.selected.length === 1) {
            let _player = $scope.selected[0];
            if (_player.hasBeenLadyOfTheLake || _player._id === user._id) return true;
        }
        return false;
    };
    $scope.disableGuessMerlin = () => {
        if ($scope.selected.length !== 1) return true;
        if ($scope.selected.length === 1) {
            let _player = $scope.selected[0];
            if (_player.loyalty !== 'good' || (_player.loyalty === 'evil' && _player.character !== 'Oberon')) return true;
        }
        return false;
    };
	$scope.useLady = () => {
        let _player = $scope.selected[0];
        $scope.selected = [];
		$scope.investigatedPlayer = {
			loyalty: _player.loyalty,
			displayName: _player.displayName
		}
		FbGamesService.useLady($scope.game.$id, _player, $scope);
	};
    $scope.isSelected = (player) => _has($scope.selected, player);
    $scope.select = (player) => $scope.isSelected(player) ? _remove($scope.selected, player) : $scope.selected.push(player);
    $scope.revealPicture = (player) => {
        if ($scope.game.waitingToPlay) return player.picture;
        if (player.onQuest && $scope.game.currentGamePhase === 'team voting') return '/img/sigil.png';
        if (player.approvedQuest && ($scope.game.currentGamePhase === 'quest voting' || _notFirstTeamProposalOfQuest())) return '/img/approve.png';
        if (!player.approvedQuest && $scope.game.currentGamePhase === 'quest voting' || _notFirstTeamProposalOfQuest()) return '/img/reject.png';
        if (game.useLady && game.currentLadyOfTheLake._id === player._id && $scope.game.currentGamePhase.slice(0, 3) !== 'end') return '/img/lady_of_the_lake.png';
        if ($scope.me(player) ||
            ($scope.game.currentGamePhase.slice(0, 3) === 'end') ||
            ($scope.game.currentGamePhase === 'guess merlin' &&
                player.loyalty === 'evil' &&
                player.character !== 'Oberon')) return player.imageUrl;
        return player.picture;
    }

});
