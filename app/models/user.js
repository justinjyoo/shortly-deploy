var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
// var db = require('../config');


var userSchema = mongoose.Schema({
  username: {type: String, required: true, index: {unique: true}},
  password: {type: String, required: true},
  timestamp: { type: Date, default: Date.now }
});

var User = mongoose.model('User', userSchema);


User.comparePassword = function(candidatePassword, savedPassword, cb) {
  bcrypt.compare(candidatePassword, savedPassword, function(err, isMatch) {
    if (err) { return cb(err); }
    cb(null, isMatch);
  });
};

// userSchema.query.remove = function(username) {
//   return this.findOneAndRemove(username);
// };

// userSchema.methods.fetch = this.findOne({username: this.username}).exec();

// userSchema.methods.save = function() {
//   return this.save();
// };

userSchema.pre('save', function(next) {
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.password, null, null).bind(this)
    .then(function(hash) {
      this.password = hash;
      next();
    });
});

module.exports = User;