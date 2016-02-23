var express = require('express');
var router = express.Router();

/* GET home page. */
/*router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;*/

module.exports = function(io){

  io.on( "connection", function( socket )
  {
    console.log( "A user connected " , socket.request.user);

    var defaultRoom = 'general';
    var rooms = ["general", "angular", "socket.io", "express", "node", "mongo", "PHP", "laravel"];

    socket.emit('setup', {
      rooms: rooms
    });

    socket.on( "send:message", function( msg )
    {
      console.log("user message ",msg);
      msg.self=false;
      socket.in(msg.room).broadcast.emit("receive:message",msg);
    });

    socket.on( "user:joined", function( msg )
    {

      socket.join(msg.room);
      socket.in(msg.room).broadcast.emit("receive:message",{ text:msg.user+' joined to room '+ msg.room + "!", room: msg.room, self:false });
    });

    socket.on( "user:left", function( msg )
    {
      socket.leave(msg.room);
      socket.in(msg.room).broadcast.emit("receive:message",{ text:msg.user+' left room '+ msg.room, room: msg.room, self:false });
    });

    socket.on('disconnect',function(){
        console.log("User disconnected ", socket.request.user);
    });

  });



  router.get('/', function(req, res, next) {
    res.render('index', { title: 'Chat Application' });
  });

  return router;

}