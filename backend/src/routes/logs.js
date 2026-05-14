const router = require('express').Router();
const { getLogs, deleteLog, exportCSV } = require('../controllers/logsController');

router.get('/', getLogs);
router.delete('/:id', deleteLog);
router.get('/export/csv', exportCSV);

module.exports = router;
