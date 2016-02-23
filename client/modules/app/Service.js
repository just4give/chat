app.factory('UserService', ["$rootScope","$http","$q", "$log",function($rootScope, $http, $q,$log){



    return{
        login : function(user){

            var deferred = $q.defer();

            $http.post("/users/login", user)
                .success(function (data){

                    deferred.resolve(data);
                })
                .error(function(err){
                    deferred.reject(err);
                });




            return deferred.promise;
        },
        loggedIn : function(){

            var deferred = $q.defer();

            $http.get( "/users/loggedin")
                .success(function (data){
                    if(data.success){
                        deferred.resolve(data);
                    }else{
                        deferred.reject('not authorized');
                    }

                })
                .error(function(err){
                    deferred.reject(err);
                });




            return deferred.promise;
        },

        logout : function(){

            var deferred = $q.defer();

            $http.post("/users/logout", {})
                .success(function (data){

                    deferred.resolve(data);
                })
                .error(function(err){
                    deferred.reject(err);
                });




            return deferred.promise;
        }

    }

}]);
