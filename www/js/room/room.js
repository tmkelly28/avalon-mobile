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

app.controller('RoomCtrl', ($scope, game, chats, user, players, userRecord, RoomViewCtrl, FirebaseEvents) => {

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
    RoomViewCtrl.registerScope($scope);

    $scope.closeGameStartModal = RoomViewCtrl.closeGameStartModal;
    $scope.closeLadyModal = RoomViewCtrl.closeLadyModal;
    $scope.closeQuestResultModal = RoomViewCtrl.closeQuestResultModal;
    $scope.addMessage = RoomViewCtrl.addMessage;
    $scope.isHost = RoomViewCtrl.isHost;
    $scope.ableToBegin = RoomViewCtrl.ableToBegin;
    $scope.startGame = RoomViewCtrl.startGame;
    $scope.me = RoomViewCtrl.me;
	$scope.proposeTeam = RoomViewCtrl.proposeTeam;
	$scope.disablePropose = RoomViewCtrl.disablePropose;
    $scope.resetTeam = RoomViewCtrl.resetTeam;
    $scope.voteApprove = RoomViewCtrl.voteApprove;
    $scope.voteReject = RoomViewCtrl.voteReject;
    $scope.successQuest = RoomViewCtrl.successQuest;
    $scope.failQuest = RoomViewCtrl.failQuest;
    $scope.guessMerlin = RoomViewCtrl.guessMerlin;
	$scope.range = RoomViewCtrl.range;
    $scope.disableLady = RoomViewCtrl.disableLady;
    $scope.disableGuessMerlin = RoomViewCtrl.disableGuessMerlin;
	$scope.useLady = RoomViewCtrl.useLady;
    $scope.isSelected = RoomViewCtrl.isSelected;
    $scope.select = RoomViewCtrl.select;
    $scope.revealPicture = RoomViewCtrl.revealPicture;

});
