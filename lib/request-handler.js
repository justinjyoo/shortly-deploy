var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');

// In Mongo, there are no distinctions between collections and models
// the models ARE collections.

// var Users = require('../app/collections/users');
// var Links = require('../app/collections/links');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Linkfind({}).exec(function(err, links) {
    res.status(200).send(links);
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }


//In bookshelf, you instantiate a new Link object in order to retrieve it
//In Mongo, you simply refer to that Link object

//And instead of invoking Fetch, you use the findOne function
//And exec is the function that invokes our action and takes a callback when that link is found
  Link.findOne({ url: uri }).exec(function(err, found) {
    if (found) {
      //we no longer attributes using the attributes property
      //we can just access it directly using 'found'
      res.status(200).send(found);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }

        //the syntax for bookshelf is almost identical to the syntax for mongoose
        //when we want to instantiate a new link
        var newLink = new Link({
          url: uri,
          title: title,
          baseUrl: req.headers.origin,
          visits: 0
        });

        //here, save takes a callback directly
        //also re-factored res.send
        newLink.save(function(err, newLink) {
          if (err) {
            res.status(500).send(err);
          } else {
            res.status(200).send(newLink);
          }
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  // just as in links, we are not instantiating a new User as we did in bookshelf
  // instead we are just using "User" and invoking the findOne function that mongoose provides us
  User.findOne({ username: username })
    // instead of using .fetch().then() we use .exec()
    // and we pass in the paramters of err and user as part of node's standard implementation
    .exec(function(err, user) {
      if (!user) {
        res.redirect('/login');
      } else {
        //we pass in err, match as parameters
        User.comparePassword(password, user.password, function(err, match) {
          if (match) {
            util.createSession(req, res, user);
          } else {
            res.redirect('/login');
          }
        });
      }
    });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  // again we're not instantiating
  User.findOne({ username: username })
    // invoking .exec() instead of .fetch().then()
    .exec(function(err, user) {
      if (!user) {
        // similar to bookshelf the instantiation of a new User object is almost identical
        // this code doesn't need to change
        var newUser = new User({
          username: username,
          password: password
        });
        // we only need to change the actual saving process
        // it doesn't need a .then()
        // we only need to use a .save()
        newUser.save(function(err, newUser) {
          if (err) {
            // and similar to above
            // on error, we will send back a 500 and the error
            res.status(500).send(err);
          }
            //otherwise we will create a new user session
          util.createSession(req, res, newUser);
        });
      } else {
        console.log('Account already exists');
        res.redirect('/signup');
      }
    });
};

//re-factor similar to above
//not instantiating a new link
//removing fetch
exports.navToLink = function(req, res) {
  Link.findOne({ code: req.params[0] }).exec(function(err, link) {
    if (!link) {
      res.redirect('/');
    } else {
      //we don't use getters and setters for link (link.get / link.set)
      //we just access the url directly
      link.visits++;
      link.save(function(err, link) {
        res.redirect(link.url);
        return;
      });

      // link.set({ visits: link.get('visits') + 1 })
      //   .save()
      //   .then(function() {
      //   });
    }
  });
};