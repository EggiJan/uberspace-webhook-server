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
  var secret = req.query.secret;

  if(!secret || secret !== config.secret) {
    return res.status(403).send({
      executed: false,
      error: 'Forbidden'
    });
  }

  var id = req.params.id;
  var hook = hooks[id];

  if(!hook) {
    return res.status(404).json({
      executed: false,
      error: 'Hook not found'
    });
  }
   
  function puts(err, stdout, stderr) {
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
  }

  exec(hook.script, puts);
});

app.all('*', function(req, res) {
  res.status(404).json({
    executed: false,
    error: 'Not found'
  })
});

app.listen(config.port, function() {
  var now = new Date();
  console.log(now.toISOString(),'--- Server started on port:', config.port);
});