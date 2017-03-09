var db = require('../config');
var crypto = require('crypto');
var mongoose = require('mongoose');
var Schema = mongoose.schema;

var urlsSchema = new Schema({
  url: String,
  baseUrl: String,
  code: String,
  title: String,
  hasTimestamps: {type: Boolean, default: true},
  visits: {type: Number, default: 0 },
  timestamps: {type: Date, default: Date.now }
});

urlsSchema.pre('save', function(next) {
  var user = this;
  var shasum = crypto.createHash('sha1');
  shasum.update(user.url);
  user.code = shasum.digest('hex');
  next();
});

//Links = table name
//We are using 'Links' name to create a table
//based off the urlsSchema we just defined
var Links = mongoose.model('Links', urlsSchema);

module.exports = Links;
