var express = require('express');
var router = express.Router();
var auth = require('../auth');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/login', auth.authenticate);

router.get('/loggedin',function(req,res,next){
  console.log('callling loggedIn');
  if(!req.isAuthenticated()) {
    res.send({success:false});
  } else {
    res.send({success:true, user: req.user});
  }
});


router.post('/logout', function(req, res) {
  req.logout();
  res.end();
});

module.exports = router;
