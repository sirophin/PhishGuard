const router = require('express').Router();
const { getQuizzes, getQuiz, submitQuiz, getProgress } = require('../controllers/quizController');

router.get('/',                    getQuizzes);
router.get('/:id',                 getQuiz);
router.post('/submit',             submitQuiz);
router.get('/progress/:userId',    getProgress);

module.exports = router;
