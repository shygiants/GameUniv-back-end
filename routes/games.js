var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Game = mongoose.model('Game');
var config = require('../config');
var ErrorThrower = require('../utils/ErrorThrower');

router.get("/", function(req, res, next) {
  next(new ErrorThrower('Test Error', 400));
});

module.exports = router;
