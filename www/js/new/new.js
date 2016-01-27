'use strict';

app.config($stateProvider => {

    $stateProvider.state('new', {
        url: '/lobby/:uid/new',
        templateUrl: 'js/new/new.html',
        controller: 'NewCtrl',
        data: {
            authenticate: true
        },
        resolve: {
            user: ($stateParams, UserService) => UserService.fetchById($stateParams.uid),
            games: FbGamesService => FbGamesService.fetchAllGames()
        }
    });
});

app.controller('NewCtrl', ($scope, $state, user, games, FbGamesService) => {

    $scope.user = user;
    $scope.games = games;
    $scope.newGame = {
        numberOfPlayers: 5,
        lady: false,
        mordred: false,
        percival: false,
        morgana: false,
        oberon: false
    };

    $scope.createNewGame = () => {
        let key = FbGamesService.pushNewGame({
            host: $scope.user._id,
            hostName: $scope.user.displayName,
            waitingToPlay: true,
            name: $scope.newGame.name,
            targetSize: $scope.newGame.numberOfPlayers,
            useMordred: $scope.newGame.mordred,
            usePercival: $scope.newGame.percival,
            useMorgana: $scope.newGame.morgana,
            useOberon: $scope.newGame.oberon,
            useLady: $scope.newGame.lady
        });

        FbGamesService.addPlayerToGame(key, $scope.user)
            .then(() => $state.go('room', { key: key }));
    }
});
