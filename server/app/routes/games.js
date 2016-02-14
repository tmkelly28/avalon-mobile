'use strict';

const router = require('express').Router();
const controller = require('./games.controller');
module.exports = router;

router.param('id', controller.setGame);

router.post('/', controller.create);
router.put('/:id/add-player', controller.addPlayer);


