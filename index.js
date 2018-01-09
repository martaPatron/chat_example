let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let port = 8000;
let redis = require('redis');
let client = redis.createClient();

app.use(express.static(__dirname));
app.get('/', function(req, res) {
    res.sendFile('index.html');
});

io.on('connection', function(socket) {
    socket.on('chat message', function(msg) {
        console.log(msg);
        io.emit('chat message', msg);
    });

    socket.emit('login user', function(data) {
        socket.broadcast.emit('login user', {
            username: data
        });
    });

    socket.broadcast.emit('disconnect');
});


client.on('error', function(err) {
    console.log('Something went wrong ', err)
});
client.set('my test key', 'my test value', redis.print);
client.get('my test key', function(error, result) {
    if (error) throw error;
    console.log('GET result ->', result)
});

http.listen(port, function() {
    console.log('listening on *:8000');
});