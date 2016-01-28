'use strict';

app.factory('GameFactory', function () {
	const factory = {};

	factory.assignQuests = function (game) {

		function Quest (questNumber, playersNeeded, toFail) {
			this.questNumber = questNumber;
			this.playersNeeded = playersNeeded;
			this.toFail = toFail;
		}

		let quests = [];
		let numberOfPlayers = Object.keys(game.players).length;

		// first quest
		if (numberOfPlayers < 8) quests.push(new Quest(1, 2, 1));
		else quests.push(new Quest(1, 3, 1));
		// second quest
		if (numberOfPlayers < 8) quests.push(new Quest(2, 3, 1));
		else quests.push(new Quest(2, 4, 1));
		// third quest
		if (numberOfPlayers === 5) quests.push(new Quest(3, 2, 1));
		else if (numberOfPlayers === 6) quests.push(new Quest(3, 4, 1));
		else if (numberOfPlayers === 7) quests.push(new Quest(3, 3, 1));
		else quests.push(new Quest(3, 4, 1));
		// fourth quest
		if (numberOfPlayers < 7) quests.push(new Quest(4, 3, 1));
		else if (numberOfPlayers === 7) quests.push(new Quest(4, 4, 2));
		else quests.push(new Quest(4, 5, 2));
		// fifth quest
		if (numberOfPlayers === 5) quests.push(new Quest(5, 3, 1));
		else if (numberOfPlayers < 8) quests.push(new Quest(5, 4, 1));
		else quests.push(new Quest(5, 5, 1));

		return quests;
	};

	factory.assignPlayerRoles = function (game) {

		function Character (loyalty, character, imageUrl, knownToMerlin, knownToEvil, knownToPercival) {
			this.loyalty = loyalty;
			this.character = character;
			this.imageUrl = imageUrl;
			this.knownToMerlin = knownToMerlin;
			this.knownToEvil = knownToEvil;
			this.knownToPercival = knownToPercival;
		}

		let characters = [];
		let good = 0;
		let bad = 0;
		let idx = 0;
		let numberOfPlayers = Object.keys(game.players).length;

		// determine the number of good and bad characters
		if (numberOfPlayers === 5) {
			good += 3;
			bad += 2;
		} else if (numberOfPlayers === 6) {
			good += 4;
			bad += 2;
		} else if (numberOfPlayers === 7) {
			good += 4;
			bad += 3
		} else if (numberOfPlayers === 8) {
			good += 5;
			bad += 3;
		} else if (numberOfPlayers === 9) {
			good += 6;
			bad += 3
		} else {
			good += 6;
			bad += 4;
		}
		// add special characters
		if (game.usePercival) {
			characters.push(new Character('good', 'Percival', '/img/percival.png', false, false, false));
			good--;
		}
		if (game.useMordred && bad > 1) {
			characters.push(new Character('evil', 'Mordred', '/img/mordred.png', false, true, false));
			bad--;
		}
		if (game.useMorgana && bad > 1) {
			characters.push(new Character('evil', 'Morgana', '/img/morgana.png', true, true, true));
			bad--;
		}
		if (game.useOberon && bad > 1) {
			characters.push(new Character('evil', 'Oberon', '/img/oberon.png', true, false, false));
		}
		// add remaining characters, including assassin and merlin
		characters.push(new Character('evil', 'Assassin', '/img/assassin.png', true, true, false));
		bad--;
		characters.push(new Character('good', 'Merlin', '/img/merlin.png', false, false, true));
		good--;
		while (good > 0) {
			characters.push(new Character('good', 'Servant of Arthur', '/img/loyal_' + good + '.png', false, false, false));
			good--;
		}
		while (bad > 0) {
			characters.push(new Character('evil', 'Minion of Mordred', '/img/minion_' + bad + '.png', true, true, false));
			bad--;
		}
		// shuffle characters
		characters = _.shuffle(characters);

		// assign characters
		for (let player in game.players) {
			let playerRef = new Firebase("https://resplendent-torch-2655.firebaseio.com/games/" + game.$id + '/players/' + player);
			playerRef.update({
				loyalty: characters[idx].loyalty,
				character: characters[idx].character,
				imageUrl: characters[idx].imageUrl,
				knownToMerlin: characters[idx].knownToMerlin,
				knownToEvil: characters[idx].knownToEvil,
				knownToPercival: characters[idx].knownToPercival,
				needToVoteForTeam: true,
				needToVoteOnQuest: true
			});
			idx++;
		}
	};

	return factory;
});
