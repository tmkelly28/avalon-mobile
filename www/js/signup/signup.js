'use strict';

app.config($stateProvider => {

    $stateProvider.state('signup', {
        url: '/signup',
        templateUrl: '/js/signup/signup.html',
        controller: 'SignupCtrl'
    });
});

app.controller('SignupCtrl', ($scope, $state, AuthService) => {
    $scope.signup = (credentials) => {
        AuthService.signup(credentials)
            .then(user => $state.go('lobby', { uid: user._id }))
            .then(null, (error) => $scope.error = error);
    }
});
