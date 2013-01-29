
var express     = require('express')
  , app         = express()
  , colors      = require('colors')
  , router      = require('./router.js')
  , config      = require('./config.js')
  , http        = require('http')
  , process     = require('./process.js')
  , fs          = require('fs')
  , mongo       = require('./database.js')
  , __timeDelta = require('./secret.js').constants.timeDelta
  , events      = require('events').EventEmitter;

// setup here
config(app);


// ---------------------------------------------------------- //
// define API routes here
// ---------------------------------------------------------- //
// GET
app.get('/',                router.index     );
app.get('/access',          router.access    );
app.get('/admin',           router.admin     );
app.get('/admin/accounts',  router.accounts  );
app.get('/db',              router.db        );
app.get('/github/accounts', router.githubjson);
app.get('/rickshaw',        router.rickshaw  );

// POST
app.post('/hook',  router.hook );
app.post('/start', router.start);
app.post('/stop',  router.stop );


// start the server
var httpApp = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port:".blue, app.get('port'));
});

// ---------------------------------------------------------- //
// Socket.io
// ---------------------------------------------------------- //
// start socket.io after the server
var io = require('socket.io').listen(httpApp).set('log level', 1);

io.sockets.on('connection', function(socket){
  console.log('SOCKET CONNECTED'.green);
  var currentTime = new Date().getTime();
  // Change this to get all data
  process.getData(currentTime, function(graph_info){
    console.log('emitting all_ur_datas');
    setTimeout(function(){
      console.log(graph_info);
      socket.emit('gimme_all_ur_datas', graph_info);
    }, 1000);
  });

  fs.watch('./server/github.json', function(cur, prev){
    var curTime = new Date().getTime();
    process.getLatestDelta(curTime, function(latestDelta){
      socket.broadcast.emit('update', latestDelta);
    });
  });

  events.on('update_commits', function(cur, prev){
    mongo.db.collection('commits', function(err, col){
      col.find().limit(1).toArray(function(err, collection){
        console.log('updatingCommitFeeds'.yellow);
        console.log(collection);
        //socket.broadcast.emit('feed', collection);
      });
    });
  });
});


exports.daemon = function(){
    // ---------------------------------------------------------- //
    // Increment the timestamp in github.json and the database
    // ---------------------------------------------------------- //
    fs.readFile('./server/github.json', 'utf-8', function(err, file){
      file = JSON.parse(file);
      console.log('file'.cyan, file.latest_timestamp);
      file.latest_timestamp += __timeDelta;
      fs.writeFile('./server/github.json', JSON.stringify(file), function(error){
        if(error) throw error;
        console.log('done writing timestamp to github.json');
        mongo.db.collection('graph_data', function(err, col){
          col.find().toArray(function(err, collection){
            for(var row in collection){
              var data_point = {};
              data_point.x = file.latest_timestamp + __timeDelta;
              data_point.y = collection[row].numCommits;
              col.update( {'repoName': collection[row].repoName}, { $push: { 'data': data_point } }, function(err, docs){
                if(err){throw err;}
              });
            }
          });
        });
      });
    });
    console.log('intervalling', new Date().getTime());
  }