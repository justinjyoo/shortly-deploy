var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var Schema = mongoose.schema;
var genSaltAsync = Promise.promisify(bcrypt.genSalt);
var hashAsync = Promise.promisify(bcrypt.hash);

var userSchema = new Schema({
  username: String,
  password: String,
  timestamp: { type: Data, default: Date.now }
});

userSchema.methods.comparePassword = function (attemptedPassword, callback) {
  bcrypt.compare(attemptedPassword, this.password, function(err, isMatch) {
    callback(isMatch);
  });
};

userSchema.pre('save', function(next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) { 
    return next();
  }

  return genSaltAsync(10)
    .then(function(salt) {
      return hashAsync(user.password, salt);
    }).then(function (hashedPassword) {
      user.password = hashedPassword;
      next();
    });
});

var User = mongoose.model('User', userSchema);

module.exports = User;