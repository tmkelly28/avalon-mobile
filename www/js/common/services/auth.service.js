'use strict';

app.service('AuthService', function ($http, Session, $rootScope, AUTH_EVENTS, $q) {

    function onSuccessfulLogin(response) {
        let data = response.data;
        Session.create(data.id, data.user);
        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
        return data.user ? data.user : data;
    }

    // Uses the session factory to see if an
    // authenticated user is currently registered.
    this.isAuthenticated = function () {
        return !!Session.user;
    };

    this.getLoggedInUser = function (fromServer) {

        // If an authenticated session exists, we
        // return the user attached to that session
        // with a promise. This ensures that we can
        // always interface with this method asynchronously.

        // Optionally, if true is given as the fromServer parameter,
        // then this cached value will not be used.

        if (this.isAuthenticated() && fromServer !== true) {
            return $q.when(Session.user);
        }

        // Make request GET /session.
        // If it returns a user, call onSuccessfulLogin with the response.
        // If it returns a 401 response, we catch it and instead resolve to null.
        return $http.get('/session').then(onSuccessfulLogin).catch(function () {
            return null;
        });

    };

    this.login = function (credentials) {
        return $http.post('/login', credentials)
            .then(onSuccessfulLogin)
            .then(null, () => $q.reject({ message: 'Invalid login credentials' }));
    };

    this.signup = function (credentials) {
        return $http.post('/api/users', credentials)
            .then(onSuccessfulLogin)
            .then(null, () => $q.reject({ message: 'Invalid entry' }));
    }

    this.logout = function () {
        return $http.get('/logout').then(function () {
            Session.destroy();
            $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
        });
    };

});
