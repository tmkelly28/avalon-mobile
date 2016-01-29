'use strict';

app.config($stateProvider => {

    $stateProvider.state('login', {
        url: '/',
        templateUrl: '/js/login/login.html',
        controller: 'LoginCtrl'
    });
});

app.controller('LoginCtrl', ($scope, $state, AuthService) => {
    $scope.login = (credentials) => {
        AuthService.login(credentials)
            .then(user => {
                $state.go('lobby', { uid: user._id })
            })
            .then(null, (error) => $scope.error = error);
    };

});
