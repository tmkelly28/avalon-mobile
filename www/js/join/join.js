'use strict'

app.config($stateProvider => {

    $stateProvider.state('join', {
        cache: false,
        url: '/lobby/:uid/join/:gid',
        templateUrl: 'js/join/join.html',
        controller: 'JoinCtrl',
        data: {
            authenticate: true
        },
        resolve: {
            game: ($stateParams, FbGamesService) => FbGamesService.fetchById($stateParams.gid),
            user: ($stateParams, UserService) => UserService.fetchById($stateParams.uid)
        }
    });
});

app.controller('JoinCtrl', ($scope, $state, $timeout, game, user, FbGamesService) => {

    let gate = false;

    $scope.game = game;
    $scope.user = user;

    $scope.joinGame = () => {
        if (gate) return;

        if (!$scope.alreadyJoined()) {
            gate = true;
            $timeout(() => gate = false, 1000);
            FbGamesService.addPlayerToGame($scope.game.$id, $scope.user)
                .then(() => {
                    $state.go('room', { key: $scope.game.$id });
                });
        } else $state.go('room', { key: $scope.game.$id });
    }

    $scope.alreadyJoined = () => Object.keys($scope.game.players).includes($scope.user.playerKey);
    $scope.numberOfPlayers = () => $scope.game.players ? Object.keys($scope.game.players).length : 1;

});
