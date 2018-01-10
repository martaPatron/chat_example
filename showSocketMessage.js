$(function() {
    console.log(localStorage);
    let currentName = localStorage.getItem('currentUser');
    $('.name').text(currentName);
    let socket = io();

    $('form').submit(function() {
        socket.emit('chat message', currentName, $('#message').val());
        $('#message').val('');
        return false;
    });

    socket.on('chat message', msg => {
        let data = JSON.parse(msg);
        addNewMessage(data);
    });

    socket.emit('connection', currentName);

    socket.on('load page', (users, messages) => {
        for (let i = 0; i < users.length; i++) {
            addNewUser(users[i]);
        }
        let newMessages = sortMessages(messages);
        for (let i = 0; i < newMessages.length; i++) {
            addNewMessage(newMessages[i]);
        }
    });
    socket.on('add new user', data => {
        addNewUser(data.user);
    });

    $('.logout').on('click', function() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem(currentName);
        socket.emit('logout', currentName);
        this.href = 'index.html';
    });

    $('.change-name').on('click', function() {
        $('.another-name').val('');
        $('.new-name-box').toggle('slow');
    });

    $('.new-name').on('click', function() {
        let newName = $('.another-name').val();
        let name = localStorage.getItem(newName);
        if (newName && !name) {
            let oldName = localStorage.getItem('currentUser');
            localStorage.removeItem(oldName);
            localStorage.setItem('currentUser', newName);
            currentName = newName;
            $('.name').text(newName);
            $('.another-name').val('');
            socket.emit('change name', oldName, newName);
        }
        $('.new-name-box').toggle('slow');
    });

    socket.on('disconnect', function() {
        let msg = `${currentName} logout`;
        $('#online-users').append($('<li>').text(msg));
    });

    function addNewUser(user) {
        $('#online-users').append($('<li>').text(user));
    }

    function addNewMessage(msg) {
        let mess = `${msg.username}: ${msg.message}`;
        $('#messages').append($('<li>').text(mess).append($('<span>').text(msg.time)));
    }

    function sortMessages(messages) {
        let listMessages = messages.map(item => JSON.parse(item));
        listMessages.sort(function(a, b) {
            return a.times - b.times;
        });
        return listMessages;
    }
});