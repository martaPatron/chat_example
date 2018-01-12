$(function() {
    const socket = io();
    let currentName;
    const warning = $('.warning');
    const nickInput = $('#nick-name');
    const usersSelector = $('#online-users');
    const inputMessage = $('.chat-message');
    const loginSection = $('.login-part');
    const chatPage = $('.chat-page');
    const content = $('.main-content');
    const messageInput = $('#message');

    nickInput.on('focus', function() {
        warning.hide();
    });
    inputMessage.hide();

    loginSection.on('submit', function() {
        let nick = nickInput.val();
        let user = localStorage.getItem('currentUser');
        if (!user) {
            if (nick) {
                currentName = nick;
                socket.emit('login user', currentName, false);
                nickInput.val('');
            } else {
                return;
            }
        } else {
          currentName = user;
          socket.emit('login user', currentName, true);
        }
        nickInput.val('');
        return false;
    });

    socket.on('user exist', function() {
      $('.warning').show();
    });

    inputMessage.submit(function() {
        socket.emit('chat message', currentName, messageInput.val());
        messageInput.val('');
        return false;
    });

    socket.on('chat message', msg => {
        let data = JSON.parse(msg);
        addNewMessage(data);
    });

    socket.on('login chat', (users, messages) => {
        clearPage();
        loginSection.hide();
        chatPage.show();
        content.show();
        inputMessage.show();
        $('.name').text(currentName);
        localStorage.setItem('currentUser', currentName);
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

    socket.on('change name in list', function(oldName, newName) {
      currentName = newName;
      let listUsers = usersSelector.children();
      for (let i = 1; i < listUsers.length; i++) {
        if (listUsers[i].textContent === oldName) {
          listUsers[i].textContent = newName;
        }
      }
    });

    socket.on('change nickName', function(name) {
        $('.name').text(name);
        localStorage.setItem('currentUser', name);
    });

    socket.on('username exist', function() {
      alert('This username already exist');
    });

    socket.on('user logout', function(user) {
        let listUsers = usersSelector.children();
        let index = 0;
        for (let i = 1; i < listUsers.length; i++) {
          if (listUsers[i].textContent === user.username) {
            index = i;
          }
        }
        if (index > 0) {
            $(`#online-users li:nth-child(${index + 1})`).remove();
        }
    });

    $('.logout').on('click', function() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem(currentName);
        socket.emit('logout', currentName);
        loginSection.show();
        chatPage.hide();
        content.hide();
        inputMessage.hide();
        clearPage();
    });

    $('.change-name').on('click', function() {
        $('.another-name').val('');
        $('.new-name-box').toggle('slow');
    });

    $('.new-name').on('click', function() {
        let newName = $('.another-name').val();
        $('.another-name').val('');
        $('.new-name-box').toggle('slow');
        let name = localStorage.getItem(newName);
        if (newName && !name) {
            let oldName = localStorage.getItem('currentUser');
            socket.emit('change name', oldName, newName);
        }
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

    function clearPage() {
      $('li').remove();
    }
});
