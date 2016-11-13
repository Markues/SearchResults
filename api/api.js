let express = require('express');
let logger = require('morgan');
let bodyParser = require('body-parser');
let api = module.exports = express();

api.use(logger('combined'));
api.use(bodyParser.json());

require('./search/routes')(api);

module.exports = api;
