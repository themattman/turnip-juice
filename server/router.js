var mongo     = require('./database.js')
	, process   = require('./process.js')
	, loop      = require('./app.js')
	, secret    = require('./secret.js').admin
	, colors    = require('colors')
	, fs        = require('fs')
	, interval
	, collection
;

mongo.connect(function(msg, coltn) {
	if(msg == null) {
		console.log("Mongo Connected!".yellow);
		collection = coltn;
	} else {
		console.log(msg);
	}
});

// Start/Stop Page for the service
exports.access = function(req, res){
	res.render('access', { title: "Access" });
};

// Configure data streams from Github
exports.accounts = function(req, res){
  res.render('accounts', { title: "Github Accounts" });
};

// DB Insertion test!??
exports.db = function(req, res){
	collection.insert({ msg: "hello world" }, function(err, docs){
		if(err){throw err;}
		res.send(docs);
	});
};

// Expose accounts
exports.githubjson  = function(req, res) {
	fs.readFile('./server/github.json', 'utf-8', function(err, accounts){
		res.json(JSON.parse(accounts));
	});
};

// Help Page
exports.help = function(req, res){
	res.render('help', { title: 'Turnip' });
};

// A POST'd hook from Github
exports.hook = function(req, res) {
	console.log('GOT A HOOK'.cyan);
	var hook_data = JSON.parse(req.body.payload);
	process.pushIntoDatabase(hook_data);
};

// Graph Page
exports.index = function(req, res){
	res.render('rickshaw', { title: 'Turnip' });
};

// Commit Message Page
exports.messages = function(req, res){
	res.render('messages', { title: 'Turnip' });
};

// Start the service
exports.start = function(req, res){
	console.log(req.body, secret.pass);
	if(req.body.password === secret.pass){
		console.log('start');
		interval = setInterval(loop.daemon, 300000);
	}
};

// Stop the service
exports.stop = function(req, res){
	console.log(req.body, secret.pass);
	console.log('stop called, not executed.');
};