let api = require('./api/api');
let express = require('express');
let cookieParser = require('cookie-parser');

// Define the args to be used for server setup
let argv = require('yargs')
            .usage('Start the server')
            .default('port', process.env.WEB_PORT || 3000)
            .alias('port', 'p')
            .describe('port', 'port to run on')
            .argv;

// Start express
let app = express();
// Use Cookies
app.use(cookieParser());

// Serve the api's
app.use(api);

// Log what the server is listening on to the console
console.log("Now listening on port " + argv.port);
console.log("Connect to http://localhost:" + argv.port);
// Start the server
app.listen(argv.port);
