const express = require('express');
const app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let port = 8000;
let redis = require('redis');
let client = redis.createClient();
const bluebird = require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

app.use(express.static(__dirname));
app.get('/', function(req, res) {
    res.sendFile('index.html');
});

client.on('error', err => {
    console.log('Something went wrong ', err);
});

io.on('connection', socket => {
    socket.on('chat message', async(username, msg) => {
        let date = new Date;
        let time = `${date.getHours()}:${date.getMinutes()}`;
        let mess = `${username}: ${msg} ${time}`;
        await client.saddAsync('messages', mess);
        io.emit('chat message', mess, time);
    });

    socket.on('connection', async username => {
        console.log('user connected');
        await client.hsetAsync('onlineUsers', username, 'true');
        const messages = await client.smembersAsync('messages');
        const keys = await client.hkeysAsync('onlineUsers');
        socket.emit('load page', keys, messages);
    });

    socket.on('logout', async username => {
        console.log('in logout');
        if (await client.hexistsAsync('onlineUsers', username)) {
            await client.hdelAsync('onlineUsers', username);
        }
      });

      socket.on('change name', async(oldName, newName) => {
          if (await client.hexistsAsync('onlineUsers', oldName)) {
            await client.hdelAsync('onlineUsers', oldName);
            await client.hsetAsync('onlineUsers', newName, true);
          }
      });
    socket.emit('disconnect');
    
});

http.listen(port, function() {
    console.log('listening on *:8000');
});