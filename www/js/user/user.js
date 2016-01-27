'use strict';

app.config($stateProvider => {
	$stateProvider.state('user', {
		url: '/user/:uid',
		templateUrl: 'js/user/user.html',
		controller: 'UserCtrl',
		data: {
			authenticate: true
		},
		resolve: {
			user: ($stateParams, UserService) => UserService.fetchById($stateParams.uid),
			statistics: ($stateParams, UserService) => UserService.fetchStatistics($stateParams.uid)
		}
	});
});

app.controller('UserCtrl', ($scope, user, statistics) => {

	$scope.user = user;
	$scope.statistics = statistics;
});
