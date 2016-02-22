var app = angular.module("chatApp",['btford.socket-io']);


app.factory('Socket',[ "socketFactory",function (socketFactory) {
    var myIoSocket = io.connect();

    var socket = socketFactory({
        ioSocket: myIoSocket
    });

    return socket;
}]);


app.controller('ChatController', ["$rootScope", "$scope","$log", "Socket", function($rootScope,$scope, $log,Socket){
    $log.debug('ChatController initialized');

    $scope.messages = [];

    $scope.message ="";
    $scope.room="";

   $scope.send = function(message){
       var newMsg = {
           text: message,
           room: $scope.room,
           user:$scope.user,
           self:true
       }

       $scope.messages.push(newMsg);
       $scope.message="";
       Socket.emit('send:message',newMsg);
    }

    $scope.join = function(room){
        $scope.joined=true;
        Socket.emit('user:joined',{
            user: $scope.user,
            room: $scope.room
        });
       $scope.messages.push(  {text:"Welcome, "+$scope.user+" to room "+$scope.room,room:$scope.room,self:false});

    }

    $scope.disconnect = function(){
        Socket.emit('user:left',{
            user: $scope.user,
            room: $scope.room
        });
        $scope.joined=false;
    }
    Socket.on("receive:message",function(msg){
         $scope.$apply(function(){
            $scope.messages.push(msg);
        });
    });

    Socket.on("setup",function(data){
        $scope.$apply(function(){
            $scope.rooms = data.rooms;
        });
    });

}]);
