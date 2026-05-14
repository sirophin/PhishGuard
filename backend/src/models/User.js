const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
  email:    { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['user','admin'], default: 'user' },
  quizProgress: [{
    quizId:      String,
    score:       Number,
    difficulty:  String,
    completedAt: Date
  }],
  emailSimResults: [{
    emailId:    String,
    userAnswer: String,
    correct:    Boolean,
    answeredAt: Date
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = model('User', UserSchema);
