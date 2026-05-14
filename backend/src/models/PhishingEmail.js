const { Schema, model } = require('mongoose');

const PhishingEmailSchema = new Schema({
  subject:     String,
  sender:      String,
  body:        String,
  isPhishing:  Boolean,
  explanation: String,
  redFlags:    [String],
  difficulty:  { type: String, enum: ['easy','medium','hard'] }
});

module.exports = model('PhishingEmail', PhishingEmailSchema);
