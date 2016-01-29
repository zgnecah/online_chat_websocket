var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
io.set('log level', 1);
io.on('connection', function(socket) {
    socket.emit('open');
    var client = {
        socket: socket,
        name: false,
        color: getColor()
    }

    socket.on('message', function(msg) {
        var obj = {
            time: getTime(),
            color: client.color
        };
        if (!client.name) {
            client.name = msg;
            obj['text'] = client.name;
            obj['auther'] = 'System';
            obj['type'] = 'welcome';
            console.log(client.name + ' login');

            socket.emit('system', obj);
            socket.broadcast.emit('system', obj);
        } else {
            obj['text'] = msg;
            obj['auther'] = client.name;
            obj['type'] = 'message';
            console.log(client.anme + ' sya: ' + msg);
            socket.emit('message', obj);
            socket.broadcast.emit('message', obj);
        }
    });

    socket.on('disconnect', function() {
        var obj = {
          time: getTime(),
          color: client.color,
          auther: 'System',
          text: client.name,
          type: 'disconnect'
        };

        socket.broadcast.emit('system', obj);
        console.log(client.name + 'Disconnect.');
    });
});

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// app.configure(function() {
//   app.set('port', process.env.PORT || 3000);
//   app.set('views', __dirname + '/views');
//   app.use(express.favicon());
//   app.use(express.logger('dev'));
//   app.use(express.bodyParser());
//   app.use(exoress.methodOverride());
//   app.use(app.router);
//   app.use(express.static(path.join(__dirname, 'public')));
// });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', routes);
// app.use('/users', users);
app.get('/', function(req, res) {
  res.sendfile('views/chat.html');
});

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

// error handlers

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
