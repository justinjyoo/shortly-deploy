var db = require('../config');
var crypto = require('crypto');
var mongoose = require('mongoose');

// there is no enforcement of a schema from the database
// we enforce a schema from the database adapter

var linkSchema = mongoose.Schema({
  visits: Number,
  link: String,
  title: String,
  code: String,
  baseUrl: String,
  url: String,
  // hasTimestamps: {type: Boolean, default: true},
  // timestamps: {type: Date, default: Date.now }
});

var Link = mongoose.model('Link', linkSchema);

//similar hooks to bookshelf
//replicates "initialize" - Mongo's version
var createSha = function(url) {
  var shasum = crypto.createHash('sha1');
  shasum.update(url);
  return shasum.digest('hex').slice(0, 5);
};

linkSchema.pre('save', function(next) {
  var code = createSha(this.url);
  this.code = code;
  next();
});



// linkSchema.query.remove = function(byUrl) {
//   return this.findOneAndRemove(byUrl);
// };

// linkSchema.methods.fetch = function() {
//   return this.model('Links').findOne({url: this.url}).exec();
// };

// linkSchema.methods.save = function() {
//   return this.save();
// };

//Links = table name
//We are using 'Links' name to create a table
//based off the linkSchema we just defined

module.exports = Link;