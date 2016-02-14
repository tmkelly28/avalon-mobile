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
			game: ($stateParams, GamesService) => GamesService.fetchById($stateParams.key),
			chats: ($stateParams, ChatService) => ChatService.fetchById($stateParams.key),
			user: (UserService, Session, GamesService, $stateParams) => {
				return UserService.fetchById(Session.user._id)
				    .then(user => GamesService.fetchPlayer($stateParams.key, user.playerKey));
			},
			userRecord: (UserService, Session) => UserService.fetchById(Session.user._id),
			players: ($stateParams, GamesService) => GamesService.fetchPlayers($stateParams.key)
		}
	});
});

app.controller('RoomCtrl', ($scope, game, chats, user, players, userRecord, RoomViewService, FirebaseEvents) => {

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
    RoomViewService.registerScope($scope);

    $scope.ableToBegin = RoomViewService.ableToBegin;
    $scope.addMessage = RoomViewService.addMessage;
    $scope.closeGameStartModal = RoomViewService.closeGameStartModal;
    $scope.closeLadyModal = RoomViewService.closeLadyModal;
    $scope.closeQuestResultModal = RoomViewService.closeQuestResultModal;
    $scope.disableGuessMerlin = RoomViewService.disableGuessMerlin;
    $scope.disableLady = RoomViewService.disableLady;
    $scope.disablePropose = RoomViewService.disablePropose;
    $scope.failQuest = RoomViewService.failQuest;
    $scope.guessMerlin = RoomViewService.guessMerlin;
    $scope.isHost = RoomViewService.isHost;
    $scope.isSelected = RoomViewService.isSelected;
    $scope.me = RoomViewService.me;
    $scope.proposeTeam = RoomViewService.proposeTeam;
    $scope.range = RoomViewService.range;
    $scope.resetTeam = RoomViewService.resetTeam;
    $scope.revealPicture = RoomViewService.revealPicture;
    $scope.select = RoomViewService.select;
    $scope.startGame = RoomViewService.startGame;
    $scope.successQuest = RoomViewService.successQuest;
    $scope.useLady = RoomViewService.useLady;
    $scope.voteApprove = RoomViewService.voteApprove;
    $scope.voteReject = RoomViewService.voteReject;

});
