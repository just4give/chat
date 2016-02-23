/**
 * Created by mithundas on 12/30/15.
 */
var passport = require('passport'),

    LocalStrategy = require('passport-local').Strategy;

var inMemoryUsers = {
    micky:{id:1,password:'password',displayName:'Micky'},
    donald:{id:2,password:'password',displayName:'Donal'},
    tom:{id:3,password:'password',displayName:'Tom'},
    jerry:{id:4,password:'password',displayName:'Jerry'}
}


module.exports = function(config) {

    var usersProjection = {
        password: false,
        salt: false
    };

    passport.use(new LocalStrategy(
        function(username, password, done) {

            console.log('calling passport.use with '+ username +" " + password);

            var user = inMemoryUsers[username];
            console.log("User ", user);
            if(user){
                return done(null,user);
            }else{
                return done(null,false);
            }

        }
    ));





    passport.serializeUser(function(user, done) {
        console.log('serialize  '+ user);
        if(user) {
            done(null, user.id);
        }
    });

    passport.deserializeUser(function(id, done) {
        console.log('deserialize '+ id);

        for (var key in inMemoryUsers) {
            var user = inMemoryUsers[key];
            if(user.id === id){
                return  done(null, user);
            }
        }

       return   done(null, false);
    })

}