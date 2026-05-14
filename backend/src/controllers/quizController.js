const QuizResult = require('../models/QuizResult');
const User       = require('../models/User');

const QUIZZES = [
  {
    id: 'beginner-01',
    title: 'Phishing Basics',
    difficulty: 'beginner',
    questions: [
      {
        id: 'q1',
        question: 'Which of the following is a common sign of a phishing email?',
        options: [
          'Email from your manager asking to review a document',
          'Urgent request to verify your account immediately or it will be closed',
          'A newsletter you subscribed to with an unsubscribe link',
          'An invoice from a vendor you regularly work with'
        ],
        correct: 1,
        explanation: 'Urgency is a classic phishing tactic to bypass critical thinking.'
      },
      {
        id: 'q2',
        question: 'You get an email from support@paypa1.com. What is suspicious?',
        options: [
          'It asks you to reset your password',
          'The domain uses number 1 instead of letter l',
          'The email mentions account security',
          'It came from a support team'
        ],
        correct: 1,
        explanation: 'Homograph attacks replace letters with similar-looking numbers.'
      }
    ]
  }
];

exports.getQuizzes = (req, res) => {
  const list = QUIZZES.map(({ id, title, difficulty, questions }) => ({
    id, title, difficulty, questionCount: questions.length
  }));
  res.json(list);
};

exports.getQuiz = (req, res) => {
  const quiz = QUIZZES.find(q => q.id === req.params.id);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  res.json(quiz);
};

exports.submitQuiz = async (req, res, next) => {
  try {
    const { quizId, answers, userId } = req.body;
    const quiz = QUIZZES.find(q => q.id === quizId);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    let score = 0;
    const gradedAnswers = answers.map(a => {
      const question = quiz.questions.find(q => q.id === a.questionId);
      const correct = question && a.selected === question.correct;
      if (correct) score++;
      return { ...a, correct };
    });

    await QuizResult.create({
      userId: userId || req.user?.id,
      quizId,
      score,
      totalQuestions: quiz.questions.length,
      difficulty: quiz.difficulty,
      answers: gradedAnswers
    });

    res.json({ score, total: quiz.questions.length, gradedAnswers });
  } catch (err) {
    next(err);
  }
};

exports.getProgress = async (req, res, next) => {
  try {
    const results = await QuizResult.find({ userId: req.params.userId })
      .sort({ completedAt: -1 }).lean();
    res.json(results);
  } catch (err) {
    next(err);
  }
};
