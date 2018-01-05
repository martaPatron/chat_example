$(function() {
    // console.log(localStorage);
    let currentName = localStorage.getItem('currentUser');
    $('.name').text(currentName);
    let socket = io();

    $('form').submit(function() {
      socket.emit('chat message', $('#message').val());
      $('#message').val('');
      return false;
    });

    socket.on('chat message', function(msg) {
      let date = new Date();
      let message = `${currentName}: \n ${msg}`;
      let timeMessage = `${date.getHours()}:${date.getMinutes()}`;
        $('#messages').append($('<li>').text(message).append($('<span>').text(timeMessage)));
      });

    $('.logout').on('click', function() {
      localStorage.removeItem('currentUser');
      localStorage.removeItem(currentName);
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
        localStorage.setItem('currentUser', newName);
        currentName = newName;
        $('.name').text(newName);
        $('.another-name').val('');
        $('.new-name-box').toggle('slow');
      } else {
        alert('Already exist');
      }
    });

    socket.on('login user', function() { // from database
      $('#online-users').append($('<li>').text(currentName));
    });
  });

