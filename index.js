let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let port = 8000;

app.use(express.static(__dirname));
app.get('/', function(req, res) {
    res.sendFile('index.html');
});

io.on('connection', function(socket) {
    socket.on('chat message', function(msg) {
        io.emit('chat message', msg);
    });

    socket.emit('login user', function(data) {
        socket.broadcast.emit('login user', {
            username: data
        });
    });

    socket.broadcast.emit('disconnect');
});

http.listen(port, function() {
    console.log('listening on *:8000');
});