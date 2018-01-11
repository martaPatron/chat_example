$(function() {
    console.log(localStorage);
    const socket = io();
    let currentName;
    const nickInput = $('#nick-name');
    const warning = $('.warning');
    const usersSelector = $('#online-users');

    nickInput.on('focus', function() {
      warning.hide();
    });

    $('.login').on('click', function() {
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
    });

    socket.on('user exist', function() {
      $('.warning').show();
    });

    $('form').submit(function() {
        socket.emit('chat message', currentName, $('#message').val());
        $('#message').val('');
        return false;
    });

    socket.on('chat message', msg => {
        let data = JSON.parse(msg);
        addNewMessage(data);
    });

    socket.on('login chat', (users, messages) => {
        $('.login-part').hide();
        $('.chat-page').show();
        $('.main-content').show();
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
        console.log(localStorage);
        addNewUser(data.user);
    });

    socket.on('change name in list', function(oldName, newName) {
      localStorage.setItem('currentUser', newName);
      currentName = newName;
      $('.name').text(newName);
      $('.another-name').val('');
      $('.new-name-box').toggle('slow');
      let listUsers = usersSelector.children();
      listUsers.map(item => {
        if (item.textContent === oldName) {
          item.textContent = newName;
        }
      });
      for (let i = 1; i < listUsers.length; i++) {
        if (listUsers[i].textContent === oldName) {
          listUsers[i].textContent = newName;
        }
      }
    });

    socket.on('username exist', function() {
      console.log('username exist changed name none');
    });

    $('.logout').on('click', function() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem(currentName);
        socket.emit('logout', currentName);
        $('.login-part').show();
        $('.chat-page').hide();
        $('.main-content').hide();
        clearPage();
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
            socket.emit('change name', oldName, newName);
        }
        // $('.new-name-box').toggle('slow');
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
      console.log('in clear page');
      // $('ul').remove('li');
      $('li').remove();
      // $('#messages').remove('li');
      // $('#online-users').remove('li');
    }
});