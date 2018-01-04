$(function() {
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
  });

