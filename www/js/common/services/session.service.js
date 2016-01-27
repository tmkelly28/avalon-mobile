'use strict';

app.service('Session', function ($rootScope, AUTH_EVENTS) {

    let self = this;

    $rootScope.$on(AUTH_EVENTS.notAuthenticated, function () {
        self.destroy();
    });

    $rootScope.$on(AUTH_EVENTS.sessionTimeout, function () {
        self.destroy();
    });

    this.id = null;
    this.user = null;

    this.create = function (sessionId, user) {
        this.id = sessionId;
        this.user = user;
    };

    this.destroy = function () {
        this.id = null;
        this.user = null;
    };
    
});
