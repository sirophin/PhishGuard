const router = require('express').Router();
const { scanUrl, getDashboardStats } = require('../controllers/scanController');
const limiter = require('../middleware/rateLimiter');

router.post('/url',  limiter, scanUrl);
router.get('/stats', getDashboardStats);

module.exports = router;
