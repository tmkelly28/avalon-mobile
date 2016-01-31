'use strict';

app.service('FirebaseEvents', function (FbGamesService, Session, UserService, $ionicModal) {

	this.registerListeners = function (game, user, scope) {

		// declare firebase references
		const fb = 'https://resplendent-torch-2655.firebaseio.com/games/';
		const gameId = game.$id;
		const gameRef = new Firebase(fb + gameId);
        const playerRef = gameRef.child('players/' + user.playerKey);
        const playerIsOnQuestRef = gameRef.child('players/' + user.playerKey + '/onQuest');
        const playerNeedToVoteForTeamRef = gameRef.child('players/' + user.playerKey + '/needToVoteForTeam');
        const playerNeedToVoteOnQuestRef = gameRef.child('players/' + user.playerKey + '/needToVoteOnQuest');
        const waitingToPlayRef = gameRef.child('waitingToPlay');
        const turnOrderRef = gameRef.child('turnOrder');
		const currentQuestPlayersGoingRef = gameRef.child('currentQuestPlayersGoing');
		const currentPlayerTurnRef = gameRef.child('currentPlayerTurn');
		const currentGamePhaseRef = gameRef.child('currentGamePhase');
		const currentQuestApprovesRef = gameRef.child('currentQuestApproves');
		const currentQuestRejectsRef = gameRef.child('currentQuestRejects');
		const currentQuestSuccessRef = gameRef.child('currentQuestSuccess');
		const currentQuestFailRef = gameRef.child('currentQuestFail');
		const currentVoteTrackRef = gameRef.child('currentVoteTrack');
		const loyalScoreRef = gameRef.child('loyalScore');
		const evilScoreRef = gameRef.child('evilScore');

		// declare helper functions
		function tallyVoting (approves, rejects) {
			if (!game.players) return; // prevent error on refresh
			let numberOfPlayers = Object.keys(game.players).length;
			if ((approves + rejects) === numberOfPlayers) {
				if (approves > rejects) FbGamesService.goToQuestVoting(gameId);
				else FbGamesService.goToNextTurn(gameId, 'rejectedQuest');
			}
		}
		function tallyGrails (successes, fails) {
			if (!game.currentQuestPlayersGoing) return; // prevent error on refresh
			let questSize = Object.keys(game.currentQuestPlayersGoing).length;
			if ((successes + fails) === questSize) {
				if (fails >= game.currentQuestToFail) FbGamesService.goToQuestResult(gameId, 'evil');
                else FbGamesService.goToQuestResult(gameId, 'good');
                $ionicModal
                    .fromTemplateUrl('js/room/questResultModal.html', {
                        scope: scope,
                        animation: 'slide-in-up'
                    })
                    .then(modal => {
                        scope.questResultModal = modal;
                        scope.questResultModal.show();
                    });
			}
		}

        //show modal at start of game
        waitingToPlayRef.on('value', snap => {
            if (!snap.val()) {
                $ionicModal
                    .fromTemplateUrl('js/room/gameStartModal.html', {
                        scope: scope,
                        animation: 'slide-in-up'
                    })
                    .then(modal => {
                        scope.gameStartModal = modal;
                        scope.gameStartModal.show();
                    });
            }
        });

        turnOrderRef.on('value', snap => {
            if (snap.val()) scope.turnOrder = snap.val();
        });

		// update voting buttons
		currentGamePhaseRef.on('value', snap => {
			if (snap.val() === 'team voting') {
				playerNeedToVoteForTeamRef.set(true);
				playerNeedToVoteOnQuestRef.set(true);
			} else if (snap.val() === 'end evil wins') playerRef.once('value', data => UserService.updateStatistics(data.val(), 'evil', false));
			else if (snap.val() === 'end good wins') playerRef.once('value', data => UserService.updateStatistics(data.val(), 'good', false));
			else if (snap.val() === 'end evil guessed merlin') playerRef.once('value', data => UserService.updateStatistics(data.val(), 'evil', true));
		});

		// update player turn
		currentPlayerTurnRef.on('value', snap => {
			if (snap.val() && (snap.val()._id === Session.user._id)) scope.myTurn = true;
			else scope.myTurn = false;
		});

		// update players going on the team
		currentQuestPlayersGoingRef.on('value', (snap) => {
			let team = snap.val();
			if (team) {
				let teamKeys = Object.keys(team);
				let teamLength = teamKeys.length;

				teamKeys.forEach(key => {
					let ref = gameRef.child('currentQuestPlayersGoing/' + key);
					ref.once('value', snapshot => {
						let teamMember = snapshot.val();
						if (teamMember._id === Session.user._id) playerIsOnQuestRef.set(true)
					});
				});

				if (teamLength < game.currentQuestPlayersNeeded) gameRef.update({ roomLeftOnTeam: true });
				else if (teamLength >= game.currentQuestPlayersNeeded) gameRef.update({ roomLeftOnTeam: false });

			} else gameRef.update({ roomLeftOnTeam: true });
		});
		currentQuestPlayersGoingRef.on('child_removed', (snap) => {
			let team = snap.val();
			let teamKeys = Object.keys(team);
			teamKeys.forEach(key => {
				let ref = gameRef.child('currentQuestPlayersGoing/' + key);
				ref.once('value', () => {
					playerIsOnQuestRef.set(false)
				});
			});
		});

		// track approvals and rejections for teams
		currentQuestApprovesRef.on('value', snap => {
			let approves = snap.val();
			let rejects = game.currentQuestRejects;
			tallyVoting(approves, rejects);
		});
		currentQuestRejectsRef.on('value', snap => {
			let rejects = snap.val();
			let approves = game.currentQuestApproves;
			tallyVoting(approves, rejects);
		});

		// track success and fail votes for quests
		currentQuestSuccessRef.on('value', snap => {
			let successes = snap.val();
			let fails = game.currentQuestFail;
			tallyGrails(successes, fails);
		});
		currentQuestFailRef.on('value', snap => {
			let fails = snap.val();
			let successes = game.currentQuestSuccess;
			tallyGrails(successes, fails);
		});

		// track end game conditions
		currentVoteTrackRef.on('value', snap => {
			if (snap.val() === 5) FbGamesService.endGame(gameId, 'evil');
		});
		loyalScoreRef.on('value', snap => {
			if (snap.val() === 3) FbGamesService.endGame(gameId, 'good');
		});
		evilScoreRef.on('value', snap => {
			if (snap.val() === 3) FbGamesService.endGame(gameId, 'evil');
		});
	};

});
