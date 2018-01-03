let app = require('express')();
let http = require('http').Server(app);
let io = require('socket')(http);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
    console.log('a user connected');
  });

http.listen(8000, function() {
  console.log('listening on *:8000');
});