var express = require('express');
var morgan = require('morgan');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

var config = require('./config');
var hooks = require('./hooks');
var app = express();

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

app.post('/hook/:id', function(req, res) {
  var timeout = null;
  var didRespond = false;
  var secret = req.query.secret;
  var id = req.params.id;
  var hook = hooks[id];

  if(!secret || secret !== config.secret || !hook) {
    res.status(404).send({
      executed: false,
      error: 'Not found'
    });
    didRespond = true;
    return;
  }
   
  function puts(err, stdout, stderr) {
    // Ignore result
    if(didRespond) {
      return;  
    }

    if(err) {
      return res.status(500).json({
        executed: false,
        error: err,
        stdout: stdout,
        stderr: stderr
      });
    }

    res.status(200).json({
      executed: true,
      stdout: stdout,
      stderr: stderr
    });

    return clearTimeout(timeout);
  }

  exec(hook.script, puts);
  
  // Respond after 9s if script takes to much time
  timeout = setTimeout(function() {
    didRespond = true;
    return res.status(200).json({
      executed: true,
      error: 'Script did not finish in time'
    });
  }, 9000);
});

app.all('/{*all}', function(req, res) {
  res.status(404).json({
    executed: false,
    error: 'Not found'
  })
});

app.listen(config.port, function() {
  var now = new Date();
  console.log(now.toISOString(),'--- Server started on port:', config.port);
});
