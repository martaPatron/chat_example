let express = require('express');
let app = express();
app.use(express.static(__dirname));

let http = require('http').Server(app);
let io = require('socket.io')(http);

app.get('/', function(req, res) {
  res.sendFile('index.html');
});

io.on('connection', function(socket) {
    // console.log('a user connected');
    // socket.on('disconnect', function() {
    //     console.log('user disconnect');
    // });
    socket.on('chat message', function(msg) {
      io.emit('chat message', msg);
    });
  });

http.listen(8000, function() {
  console.log('listening on *:8000');
});
