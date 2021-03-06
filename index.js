const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = 8000;
const redis = require('redis');
const bluebird = require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const config = process.env.REDIS === 'remote' ? {
    url: 'redis-13166.c8.us-east-1-4.ec2.cloud.redislabs.com',
    port: '13166'
} : {
    url: 'localhost',
    port: '6376'
};

let client = redis.createClient(config.port, config.url);

client.auth(function(err) {
    if (err) {
        console.log(`Error from redis: ${err}`);
        throw err;
    }
});

app.use(express.static(__dirname));
app.get('/', function(req, res) {
    res.sendFile('index.html');
});

client.on('connect', function() {
    console.log('Connected to Redis');
    console.log(config.url);
});

client.on('error', err => {
    console.log('Something went wrong ', err);
});

io.on('connection', socket => {
    let nameOfUser = '';
    socket.on('chat message', async(user, msg) => {
        try {
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
        } catch (error) {
            console.log(`Message cannot send: ${error}`);
        }
    });

    socket.on('login user', async(username, status) => {
        try {
            let keys = await client.hkeysAsync('listOfUsers');
            let isUser = keys.indexOf(username);
            nameOfUser = username;
            if (status) {
                let alreadyOnline = await client.hkeysAsync('onlineUsers');
                if (alreadyOnline.indexOf(username) < 0) {
                    await client.hsetAsync('onlineUsers', username, 'true');
                    socket.broadcast.emit('add new user', {
                        user: username
                    });
                }
                let keys = await client.hkeysAsync('onlineUsers');
                const messages = await client.smembersAsync('messages');
                socket.emit('login chat', keys, messages);
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
        } catch (error) {
            console.log('User cannot login');
            console.log(error);
        }
    });

    socket.on('logout', async username => {
        try {
            if (await client.hexistsAsync('onlineUsers', username)) {
                await client.hdelAsync('onlineUsers', username);
                await client.hdelAsync('listOfUsers', username);
                socket.broadcast.emit('user logout', {
                    username: username
                });
            }
        } catch (error) {
            console.log(`Before logout: ${error}`);
        }
    });

    socket.on('change name', async(oldName, newName) => {
        try {
            if (await client.hexistsAsync('onlineUsers', oldName)) {
                let names = await client.hkeysAsync('listOfUsers');
                if (names.indexOf(newName) <= 0) {
                    await Promise.all([
                        client.hdelAsync('onlineUsers', oldName),
                        client.hdelAsync('listOfUsers', oldName),
                        client.hsetAsync('onlineUsers', newName, 'true'),
                        client.hsetAsync('listOfUsers', newName, 'true')
                    ]);
                    io.emit('change name in list', oldName, newName);
                    socket.emit('change nickName', newName);
                    nameOfUser = newName;
                } else {
                    socket.emit('username exist');
                }
            }
        } catch (error) {
            console.log('In change name of user');
            console.log(error);
        }
    });

    socket.on('disconnect', async function() {
        try {
            if (await client.hexistsAsync('onlineUsers', nameOfUser)) {
                await client.hdelAsync('onlineUsers', nameOfUser);
                socket.broadcast.emit('user logout', {
                    username: nameOfUser
                });
            }
        } catch (error) {
            console.log(`User disconnected, something went wrong: ${error}`);
        }
    });
});

http.listen(process.env.PORT || port, function() {
    console.log(`listening on *:${port}`);
});
