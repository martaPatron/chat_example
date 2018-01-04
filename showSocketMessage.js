$(function() {
    console.log(localStorage);
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
      let timeMessage = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        $('#messages').append($('<li>').text(msg).append($('<span>').text(timeMessage)));
      });
    $('.logout').on('click', function() {
      localStorage.removeItem('currentUser');
      localStorage.removeItem(currentName);
      this.href = 'index.html';
    });
  });

