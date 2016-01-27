'use strict';

window.app = angular.module('avalon', ['ionic', 'firebase'])

    .config($urlRouterProvider => {
        $urlRouterProvider.otherwise('/');
    })

    .run(($ionicPlatform, $rootScope, $state, AuthService) => {
        $ionicPlatform.ready(() => {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) StatusBar.styleDefault();
        });

        // The given state requires an authenticated user.
        function _destinationStateRequiresAuth (state) {
            return state.data && state.data.authenticate;
        };

        $rootScope.$on('$stateChangeStart', (event, toState, toParams) => {
            if (!_destinationStateRequiresAuth(toState)) return;
            if (AuthService.isAuthenticated()) return;
            event.preventDefault();
            AuthService.getLoggedInUser()
                .then(user => user ? $state.go(toState.name, toParams) : $state.go('login'));
        });
    });
