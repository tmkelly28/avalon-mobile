'use strict';

app.config($stateProvider => {

    $stateProvider.state('new', {
        cache: false,
        url: '/lobby/:uid/new',
        templateUrl: 'js/new/new.html',
        controller: 'NewCtrl',
        data: {
            authenticate: true
        },
        resolve: {
            user: ($stateParams, UserService) => UserService.fetchById($stateParams.uid),
            games: GamesService => GamesService.fetchAllGames()
        }
    });
});

app.controller('NewCtrl', ($scope, $state, user, games, GamesService) => {

    $scope.user = user;
    $scope.games = games;
    $scope.error = false;
    $scope.newGame = {
        numberOfPlayers: 5,
        lady: false,
        mordred: false,
        percival: false,
        morgana: false,
        oberon: false
    };

    $scope.createNewGame = () => {
        if (!$scope.newGame.name) return $scope.error = true;
        let newGame = {
            host: $scope.user._id,
            hostName: $scope.user.displayName,
            waitingToPlay: true,
            name: $scope.newGame.name,
            targetSize: $scope.newGame.numberOfPlayers,
            useMordred: $scope.newGame.mordred,
            usePercival: $scope.newGame.percival,
            useMorgana: $scope.newGame.morgana,
            useOberon: $scope.newGame.oberon,
            useLady: $scope.newGame.lady,
            gameOver: false
        };

        return GamesService
            .pushNewGame(newGame, $scope.user)
            .then(key => $state.go('room', { key: key }));
    }
});
