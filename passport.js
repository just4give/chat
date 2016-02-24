/**
 * Created by mithundas on 12/30/15.
 */
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var _ = require('lodash');

var inMemoryUsers = [
    {id:1,username:'micky',password:'password',displayName:'Micky'},
    {id:2,username:'donald',password:'password',displayName:'Donal'},
    {id:3,username:'tom',password:'password',displayName:'Tom'},
    {id:4,username:'jerry',password:'password',displayName:'Jerry'}
]


module.exports = function(config) {



    passport.use(new LocalStrategy(
        function(username, password, done) {

            console.log('calling passport.use with '+ username +" " + password);

            var user = _.find(inMemoryUsers, { 'username': username, 'password': password });

            if(user){
                return done(null,user);
            }else{
                return done(null,false);
            }

        }
    ));





    passport.serializeUser(function(user, done) {
        console.log('serialize user ',user);
        if(user) {
            done(null, user.id);
        }
    });

    passport.deserializeUser(function(id, done) {
        console.log('deserialize user ', id);
        var user = _.find(inMemoryUsers, { 'id': id });
        if(user){
            return  done(null, user);
        }else{
            return   done(null, false);
        }

    })

}