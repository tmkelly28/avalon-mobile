'use strict';

app.config($stateProvider => {

	$stateProvider.state('room', {
        cache: false,
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

app.controller('RoomCtrl', ($scope, game, chats, user, players, userRecord, RoomViewCtrl, FirebaseEvents) => {

    $scope.chats = chats;
    $scope.game = game;
    $scope.gameStartModal = $scope.ladyModal = $scope.questResultModal = null;
    $scope.investigatedPlayer = null;
    $scope.myTurn = false;
    $scope.players = players;
    $scope.selected = [];
    $scope.turnOrder = null;
    $scope.user = user;
    $scope.userRecord = userRecord;

    FirebaseEvents.registerListeners($scope.game, $scope.userRecord, $scope);
    RoomViewCtrl.registerScope($scope);

    $scope.ableToBegin = RoomViewCtrl.ableToBegin;
    $scope.addMessage = RoomViewCtrl.addMessage;
    $scope.closeGameStartModal = RoomViewCtrl.closeGameStartModal;
    $scope.closeLadyModal = RoomViewCtrl.closeLadyModal;
    $scope.closeQuestResultModal = RoomViewCtrl.closeQuestResultModal;
    $scope.disableGuessMerlin = RoomViewCtrl.disableGuessMerlin;
    $scope.disableLady = RoomViewCtrl.disableLady;
    $scope.disablePropose = RoomViewCtrl.disablePropose;
    $scope.failQuest = RoomViewCtrl.failQuest;
    $scope.guessMerlin = RoomViewCtrl.guessMerlin;
    $scope.isHost = RoomViewCtrl.isHost;
    $scope.isSelected = RoomViewCtrl.isSelected;
    $scope.me = RoomViewCtrl.me;
    $scope.proposeTeam = RoomViewCtrl.proposeTeam;
    $scope.range = RoomViewCtrl.range;
    $scope.resetTeam = RoomViewCtrl.resetTeam;
    $scope.revealPicture = RoomViewCtrl.revealPicture;
    $scope.select = RoomViewCtrl.select;
    $scope.startGame = RoomViewCtrl.startGame;
    $scope.successQuest = RoomViewCtrl.successQuest;
    $scope.useLady = RoomViewCtrl.useLady;
    $scope.voteApprove = RoomViewCtrl.voteApprove;
    $scope.voteReject = RoomViewCtrl.voteReject;

});
