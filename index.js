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
    let nameOfUser = '';
    socket.on('chat message', async(user, msg) => {
        let date = new Date;
        let hour = `${date.getHours()}:${date.getMinutes()}`;
        let mess = {
            username: user,
            message: msg,
            time: hour,
            times: Date.now()
        };
        await client.saddAsync('messages', JSON.stringify(mess));
        io.emit('chat message', JSON.stringify(mess));
    });

    socket.on('login user', async(username, status) => {
        let keys = await client.hkeysAsync('listOfUsers');
        let isUser = keys.indexOf(username);
        nameOfUser = username;
        if (status) {
            await client.hsetAsync('onlineUsers', username, 'true');
            let keys = await client.hkeysAsync('onlineUsers');
            const messages = await client.smembersAsync('messages');
            socket.emit('login chat', keys, messages);
            socket.broadcast.emit('add new user', {
                user: username
            });
        } else if (isUser >= 0) {
            socket.emit('user exist');
        } else {
            await client.hsetAsync('onlineUsers', username, 'true');
            await client.hsetAsync('listOfUsers', username, 'true');
            let keys = await client.hkeysAsync('onlineUsers');
            const messages = await client.smembersAsync('messages');
            socket.emit('login chat', keys, messages);
            socket.broadcast.emit('add new user', {
                user: username
            });
        }
    });

    socket.on('logout', async username => {
        if (await client.hexistsAsync('onlineUsers', username)) {
            await client.hdelAsync('onlineUsers', username);
            await client.hdelAsync('listOfUsers', username);
        }
    });

    socket.on('change name', async(oldName, newName) => {
        if (await client.hexistsAsync('onlineUsers', oldName)) {
            let names = await client.hkeysAsync('listOfUsers');
            if (names.indexOf(newName) <= 0) {
                await Promise.all([
                    client.hdelAsync('onlineUsers', oldName),
                    client.hdelAsync('listOfUsers', oldName),
                    client.hsetAsync('onlineUsers', newName, 'true'),
                    client.hsetAsync('listOfUsers', newName, 'true')
                ]);
                socket.emit('change name in list', oldName, newName);
            } else {
                socket.emit('username exist');
            }
        }
    });

    socket.on('disconnect', async function() {
        if (await client.hexistsAsync('onlineUsers', nameOfUser)) {
            await client.hdelAsync('onlineUsers', nameOfUser);
        }
    });
});

http.listen(port, function() {
    console.log('listening on *:8000');
});
