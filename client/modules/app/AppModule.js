var app = angular.module("chatApp",['ui.router','btford.socket-io','toaster','ngAnimate']);


app.config(["$stateProvider","$urlRouterProvider", "$locationProvider",
    function($stateProvider, $urlRouterProvider, $locationProvider) {

        var routeChecks = {
            loggedIn: {auth: function(UserService) {
                return UserService.loggedIn();
            }}
        }

        $urlRouterProvider.otherwise('login');

        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'modules/tmpl/login.html',
                controller: "LoginController"
            }).state('chat', {
                url: '/chat',
                templateUrl: 'modules/tmpl/chat.html',
                controller: "ChatController",
                resolve:routeChecks.loggedIn
            })
        ;



    }]);

app.run(["$log","$rootScope", "$state", "UserService",function ($log,$rootScope, $state, UserService) {

    $rootScope.$on("$stateChangeStart", function (event, next, current) {


        UserService.loggedIn().then(function (data) {
            if (data) {
                $rootScope.loggedIn = true;
                $rootScope.user = data.user.displayName;
            }
        });
    });

    $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, rejection) {


        if(rejection === 'not authorized') {
            $state.go('login');
        }
    })
}]);
app.factory('Socket',[ "socketFactory",function (socketFactory) {
    var myIoSocket = io.connect();

    var socket = socketFactory({
        ioSocket: myIoSocket
    });

    return socket;
}]);


app.controller('LoginController', ["$rootScope", "$scope","$log", "UserService","$state", "toaster",function($rootScope,$scope, $log,UserService,$state,toaster){
    $log.debug('LoginController initialized');

    $scope.messages = [];

    $scope.message ="";
    $scope.room="";
    $scope.user={};
    $scope.login = function(){
        UserService.login($scope.user)
            .then(function(data){
                $log.debug(data);
                if(data.success){
                    $rootScope.loggedIn = true;
                    $rootScope.user = data.user.displayName;
                    $state.go('chat')
                }else{
                    $log.debug('toast');
                    toaster.pop("error","","Invalid login credential");
                }
            },function(err){

            });
    }


}]);

app.controller('ChatController', ["$rootScope", "$scope","$log", "Socket","UserService","$state","toaster", function($rootScope,$scope, $log,Socket,UserService,$state,toaster){
    $log.debug('ChatController initialized');

    $scope.messages = [];

    $scope.message ="";
    $scope.room="general";

   Socket.on('error', function (ev, data) {
        $log.debug("error ");
        toaster.pop("error","","Could not connect to chat server");
    });


   Socket.connect();

   $scope.send = function(message){
       var newMsg = {
           text: message,
           room: $scope.room,
           user:$rootScope.user,
           self:true
       }

       $scope.messages.push(newMsg);
       $scope.message="";
       Socket.emit('send:message',newMsg);
    }

    $scope.join = function(room){

        $scope.joined=true;
        Socket.emit('user:joined',{
            user: $rootScope.user,
            room: $scope.room
        });
       $scope.messages.push(  {text:"Welcome, "+$rootScope.user+" to room "+$scope.room,room:$scope.room,self:false});

    }

    $scope.disconnect = function(){

        Socket.emit('user:left',{
            user: $rootScope.user,
            room: $scope.room
        });
        $scope.joined=false;
        Socket.disconnect(true);
    }
    Socket.on("receive:message",function(msg){
         $scope.$apply(function(){
            $scope.messages.push(msg);
        });
    });

    Socket.on("setup",function(data){
        $log.debug("setup rooms received from server");
        $scope.$apply(function(){
            $scope.rooms = data.rooms;
        });
    });

    $scope.logout = function(){
        UserService.logout()
            .then(function(data){
                $log.debug(data);
                $rootScope.loggedIn = undefined;
                $rootScope.user = undefined;
                $state.go('login');
                Socket.disconnect(true);
            },function(err){

            });
    }

}]);
