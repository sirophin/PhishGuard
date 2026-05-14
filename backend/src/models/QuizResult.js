const { Schema, model } = require('mongoose');

const QuizResultSchema = new Schema({
  userId:         { type: Schema.Types.ObjectId, ref: 'User' },
  quizId:         { type: String, required: true },
  score:          Number,
  totalQuestions: Number,
  difficulty:     { type: String, enum: ['beginner','intermediate','advanced'] },
  answers:        [{ questionId: String, selected: String, correct: Boolean }],
  completedAt:    { type: Date, default: Date.now }
});

module.exports = model('QuizResult', QuizResultSchema);
