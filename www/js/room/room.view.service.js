'use strict';

app.service('RoomViewService', function (Session, FbChatService, FbGamesService) {

    let $scope;

    function _remove (playerArray, player) {
        let idx = _.findIndex(playerArray, { _id: player._id });
        idx > -1 ? playerArray.splice(idx, 1) : null;
    }

    function _has (playerArray, player) {
        return _.findIndex(playerArray, { _id: player._id }) > -1;
    }

    function _notFirstTeamProposalOfQuest () {
        return $scope.game.currentGamePhase === 'team building' &&
            $scope.game.currentVoteTrack !== 0;
    }

    function _addToTeam (player) {
        FbGamesService.addToTeam($scope.game.$id, player);
    }

    function _phaseIs (phase) {
        if (phase === 'end') return $scope.game.currentGamePhase.slice(0, 3) === phase;
        return $scope.game.currentGamePhase === phase;
    }

    this.registerScope = (scope) => $scope = scope;

    this.closeGameStartModal = () => {
        $scope.gameStartModal
            .hide()
            .then(() => $scope.gameStartModal.remove());
    };
    this.closeLadyModal = () => {
        $scope.ladyModal
            .hide()
            .then(() => $scope.ladyModal.remove());
    };
    this.closeQuestResultModal = () => {
        $scope.questResultModal
            .hide()
            .then(() => $scope.questResultModal.remove());
    };
    this.addMessage = (message) => {
        message.text ? FbChatService.addChat($scope.chats, Session.user, message.text) : null;
        message.text = '';
    };
    this.isHost = () => Session.user._id === $scope.game.host;
    this.ableToBegin = () => Object.keys($scope.game.players).length >= $scope.game.targetSize && Object.keys($scope.game.players).length < 11;
    this.startGame = () => FbGamesService.startGame($scope.game);
    this.me = (player) => player._id === $scope.user._id;
    this.proposeTeam = () => {
        return Promise.all($scope.selected.map(_player => _addToTeam(_player)))
            .then(() => {
                $scope.selected = [];
                FbGamesService.proposeTeam($scope.game.$id);
            });
    };
    this.disablePropose = () => $scope.selected.length !== $scope.game.currentQuestPlayersNeeded;
    this.resetTeam = () => {
        $scope.selected = [];
        FbGamesService.resetTeam($scope.game.$id)
    };
    this.voteApprove = () => FbGamesService.approveTeam($scope.game.$id, $scope.userRecord.playerKey);
    this.voteReject = () => FbGamesService.rejectTeam($scope.game.$id, $scope.userRecord.playerKey);
    this.successQuest = () => FbGamesService.voteToSucceed($scope.game.$id, $scope.userRecord.playerKey);
    this.failQuest = () => FbGamesService.voteToFail($scope.game.$id, $scope.userRecord.playerKey);
    this.guessMerlin = () => {
        let _player = $scope.selected[0];
        $scope.selected = [];
        FbGamesService.guessMerlin($scope.game.$id, _player);
    };
    this.range = (n, m) => _.range(n, m);
    this.disableLady = () => {
        if ($scope.selected.length !== 1) return true;
        if ($scope.selected.length === 1) {
            let _player = $scope.selected[0];
            if (_player.hasBeenLadyOfTheLake || _player._id === user._id) return true;
        }
        return false;
    };
    this.disableGuessMerlin = () => {
        if ($scope.selected.length !== 1) return true;
        if ($scope.selected.length === 1) {
            let _player = $scope.selected[0];
            if (_player.loyalty !== 'good' || (_player.loyalty === 'evil' && _player.character !== 'Oberon')) return true;
        }
        return false;
    };
    this.useLady = () => {
        let _player = $scope.selected[0];
        $scope.selected = [];
        $scope.investigatedPlayer = {
            loyalty: _player.loyalty,
            displayName: _player.displayName
        }
        FbGamesService.useLady($scope.game.$id, _player, $scope);
    };
    this.isSelected = (player) => _has($scope.selected, player);
    this.select = (player) => $scope.isSelected(player) ? _remove($scope.selected, player) : $scope.selected.push(player);
    this.revealPicture = (player) => {
        if ($scope.game.waitingToPlay) return player.picture;
        if (player.onQuest && _phaseIs('team voting')) return '/img/sigil.png';
        if (player.approvedQuest && (_phaseIs('quest voting') || _notFirstTeamProposalOfQuest())) return '/img/approve.png';
        if (!player.approvedQuest && (_phaseIs('quest voting') || _notFirstTeamProposalOfQuest())) return '/img/reject.png';
        if ($scope.game.useLady && $scope.game.currentLadyOfTheLake._id === player._id && !_phaseIs('end')) return '/img/lady_of_the_lake.png';
        if ($scope.me(player) ||
            (_phaseIs('end')) ||
            (_phaseIs('guess merlin') &&
                player.loyalty === 'evil' &&
                player.character !== 'Oberon')) return player.imageUrl;
        return player.picture;
    };

});
