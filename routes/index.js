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
    console.log( "** New user connected " , socket.request.user);

    var defaultRoom = 'general';
    var rooms = ["general", "angular", "socket.io", "express", "node", "mongo", "PHP", "laravel"];

    socket.emit('setup', {
      rooms: rooms
    });

    socket.on( "send:message", function( msg )
    {
      console.log("user message ",msg);
      console.log("received from ", socket.request.user);
      msg.self=false;
      msg.user=socket.request.user.displayName;
      socket.in(msg.room).broadcast.emit("receive:message",msg);
    });

    socket.on( "user:joined", function( msg )
    {

      socket.join(msg.room);
      socket.in(msg.room).broadcast.emit("receive:message",{ text:socket.request.user.displayName+' joined to room '+ msg.room + "!", room: msg.room, self:false });
    });

    socket.on( "user:left", function( msg )
    {
      socket.leave(msg.room);
      socket.in(msg.room).broadcast.emit("receive:message",{ text:socket.request.user.displayName+' left room '+ msg.room, room: msg.room, self:false });
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