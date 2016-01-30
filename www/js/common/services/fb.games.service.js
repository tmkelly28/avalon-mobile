'use strict';

app.service('FbGamesService', function ($firebaseArray, $firebaseObject, GameFactory, UserService) {

	const gamesRef = new Firebase("https://resplendent-torch-2655.firebaseio.com/games");
	const service = this;

	service.fetchAllGames = function () {
		return $firebaseArray(gamesRef);
	};

	service.fetchById = function (key) {
		let gameRef = gamesRef.child(key);
		return $firebaseObject(gameRef);
	};

	service.pushNewGame = function (game) {
		let ref = gamesRef.push();
		ref.set(game);
		return ref.key();
	};

	service.addPlayerToGame = function (gameKey, player) {
		let playersRef = gamesRef.child(gameKey + "/players");
		return new Promise((resolve, reject) => {
			let ref = playersRef.push();
			let key = ref.key();

			UserService.update(player._id, { playerKey: key })
			.then(updatedPlayer => {
				ref.set(updatedPlayer);
				resolve(key);
			})
			.then(null, err => reject(err));
		})
		.then(null, err => console.error(err));
	};

	service.fetchPlayer = function (gameKey, playerKey) {
		let playerRef = gamesRef.child(gameKey + "/players/" + playerKey);
		return $firebaseObject(playerRef);
	};

	service.fetchPlayers = function (gameKey) {
		let playersRef = gamesRef.child(gameKey + "/players");
		return $firebaseObject(playersRef);
	};

	service.startGame = function (game) {
		let gameRef = gamesRef.child(game.$id);
		let quests = GameFactory.assignQuests(game);
		GameFactory.assignPlayerRoles(game);
		let turnOrder = _.shuffle(game.players);
		let lady;
		if (game.useLady) {
			lady = turnOrder[turnOrder.length - 1];
			let ladyRef = gamesRef.child(game.$id + '/players/' + lady.playerKey + '/hasBeenLadyOfTheLake');
			ladyRef.set(true);
		}
		else lady = null;

		gameRef.update({
			waitingToPlay: false,
			turnOrder: turnOrder,
			quests: quests,
			loyalScore: 0,
			evilScore: 0,
			currentPlayerTurn: turnOrder[0],
			currentLadyOfTheLake: lady,
			currentGamePhase: 'team building',
			roomLeftOnTeam: true,
			currentTurnIdx: 0,
			currentVoteTrack: 0,
			currentQuestIdx: 0,
			currentQuestPlayersNeeded: quests[0].playersNeeded,
			currentQuestPlayersGoing: null,
			currentQuestToFail: quests[0].toFail,
			currentQuestApproves: 0,
			currentQuestRejects: 0,
			currentQuestSuccess: 0,
			currentQuestFail: 0
		});
	};

	service.approveTeam = function (id, playerKey) {
		let approveRef = gamesRef.child(id + '/currentQuestApproves');
		let playerApprovedRef = gamesRef.child(id + '/players/' + playerKey + '/approvedQuest');
		let playerNeedsToVoteRef = gamesRef.child(id + '/players/' + playerKey + '/needToVoteForTeam');
		approveRef.transaction(currentVal => (currentVal + 1));
		playerApprovedRef.set(true);
		playerNeedsToVoteRef.set(false);
	};

	service.rejectTeam = function (id, playerKey) {
		let rejectRef = gamesRef.child(id + '/currentQuestRejects');
		let playerApprovedRef = gamesRef.child(id + '/players/' + playerKey + '/approvedQuest');
		let playerNeedsToVoteRef = gamesRef.child(id + '/players/' + playerKey + '/needToVoteForTeam');
		rejectRef.transaction(currentVal => (currentVal + 1));
		playerApprovedRef.set(false);
		playerNeedsToVoteRef.set(false);
	};

	service.voteToSucceed = function (id, playerKey) {
		let ref = gamesRef.child(id + '/currentQuestSuccess');
		let playerNeedsToVoteRef = gamesRef.child(id + '/players/' + playerKey + '/needToVoteOnQuest');
		ref.transaction(currentVal => (currentVal + 1));
		playerNeedsToVoteRef.set(false);
	};

	service.voteToFail = function (id, playerKey) {
		let ref = gamesRef.child(id + '/currentQuestFail');
		let playerNeedsToVoteRef = gamesRef.child(id + '/players/' + playerKey + '/needToVoteOnQuest');
		ref.transaction(currentVal => (currentVal + 1));
		playerNeedsToVoteRef.set(false);
	};

	service.addToTeam = function (id, player) {
		let teamRef = gamesRef.child(id + '/currentQuestPlayersGoing');
		let newTeamMemberRef = teamRef.push();
		newTeamMemberRef.set(player);
	};

	service.proposeTeam = function (id) {
		let ref = gamesRef.child(id + '/currentGamePhase');
		ref.set('team voting');
	};

	service.resetTeam = function (id) {
		let ref = gamesRef.child(id + '/currentQuestPlayersGoing');
		ref.set(null);
	};

	service.goToQuestVoting = function (id) {
		let ref = gamesRef.child(id + '/currentGamePhase');
		ref.set('quest voting');
	};

	service.goToQuestResult = function (id, result) {
		let loyalScoreRef = gamesRef.child(id + '/loyalScore');
		let evilScoreRef = gamesRef.child(id + '/evilScore');
		if (result === 'evil') {
			evilScoreRef.transaction(currentVal => (currentVal + 1));
			evilScoreRef.once('value', snap => {
				if (snap.val() === 3) return;
				else {
					service.goToNextQuest(id, 'fail');
				}
			});
		} else {
			loyalScoreRef.transaction(currentVal => (currentVal + 1));
			loyalScoreRef.once('value', snap => {
				if (snap.val() === 3) return;
				else {
					service.goToNextQuest(id, 'success');
				}
			});
		}
	};

	service.goToNextQuest = function (id, prevQuestStatus) {
		let gameRef = gamesRef.child(id);
		let questRef = gameRef.child('quests');
		gameRef.once('value', snap => {
			let game = snap.val();
			let oldIdx = game.currentQuestIdx;
			let newIdx = game.currentQuestIdx + 1;
			questRef.once('value', snapshot => {
				let questArray = snapshot.val();
				questArray[oldIdx].status = prevQuestStatus;
				questRef.set(questArray);
			});
			if (newIdx < 5) {

				gameRef.update({
					currentVoteTrack: 0,
					currentQuestIdx: newIdx,
					currentQuestPlayersNeeded: game.quests[newIdx].playersNeeded,
					currentQuestPlayersGoing: null,
					currentQuestToFail: game.quests[newIdx].toFail,
					currentQuestApproves: 0,
					currentQuestRejects: 0,
					currentQuestSuccess: 0,
					currentQuestFail: 0,
					previousQuestSuccess: game.currentQuestSuccess,
					previousQuestFail: game.currentQuestFail
				});
			} // score listener should take over otherwise
			service.goToNextTurn(id, false);
		});
	};

	service.goToNextTurn = function (id, rejectedQuest) {
		let gameRef = gamesRef.child(id);

		gameRef.once('value', snap => {
			let game = snap.val();
			let newIdx = game.currentTurnIdx + 1;
			let numberOfPlayers = Object.keys(game.players).length;
			if (newIdx === numberOfPlayers) newIdx = 0;

			let newVoteTrack;
			if (rejectedQuest) newVoteTrack = game.currentVoteTrack + 1;
			else newVoteTrack = 0;

			let nextPhase = 'team building';
			if (game.useLady && (game.currentQuestIdx > 1 && game.currentQuestIdx < 5) && !rejectedQuest) nextPhase = 'using lady';

			gameRef.update({
				currentVoteTrack: newVoteTrack,
				currentGamePhase: nextPhase,
				currentTurnIdx: newIdx,
				currentQuestPlayersGoing: null,
				currentQuestApproves: 0,
				currentQuestRejects: 0,
				currentPlayerTurn: game.turnOrder[newIdx]
			});
		});
	};

	service.endGame = function (id, result) {
		let gameRef = gamesRef.child(id);
		if (result === 'evil') gameRef.update({ currentGamePhase: 'end evil wins' });
		else if (result === 'merlinGuessed') gameRef.update({ currentGamePhase: 'end evil guessed merlin' });
		else if (result === 'merlinNotGuessed') gameRef.update({ currentGamePhase: 'end good wins' });
		else gameRef.update({ currentGamePhase: 'guess merlin' });
	};

	service.guessMerlin = function (id, player) {
		let identityRef = gamesRef.child(id + '/players/' + player.playerKey + '/character');
		identityRef.once('value', snap => {
			if (snap.val() === 'Merlin') service.endGame(id, 'merlinGuessed');
			else service.endGame(id, 'merlinNotGuessed');
		})
	};

	service.useLady = function (id, player) {
		let gameRef = gamesRef.child(id);
		let playerHasBeenLadyRef = gameRef.child('players/' + player.playerKey + '/hasBeenLadyOfTheLake');
		playerHasBeenLadyRef.set(true);
		gameRef.update({
			currentLadyOfTheLake: player,
			currentGamePhase: 'team building'
		});
	};

});
