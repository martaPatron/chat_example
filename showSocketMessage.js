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

    socket.on('chat message', function(msg, date) {
        addNewMessage(msg);
    });

    socket.emit('connection', currentName);

    socket.on('load page', (users, messages) => {
      for (let i = 0; i < users.length; i++) {
        addNewUser(users[i]);
      }
      console.log(messages);
      for (let i = 0; i < messages.length; i++) {
        addNewMessage(messages[i]);
      }
      console.log('mess:');
      sortMessages(messages);
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
      let beginTime = msg.lastIndexOf(' ');
      let date = msg.substring(beginTime, msg.length);
      let mess = msg.substring(0, beginTime + 1);
      $('#messages').append($('<li>').text(mess).append($('<span>').text(date)));
    }

    function sortMessages(messages) {
      let messagesObjects = messages.map( item => {
        let beginTime = item.lastIndexOf(' ');
        let date = item.substring(beginTime, item.length);
        let mess = item.substring(0, beginTime + 1);
        return {
          message: mess,
          time: date
        };
      });
      console.log(messagesObjects);
    }
});