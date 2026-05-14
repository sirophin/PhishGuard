const ScanLog = require('../models/ScanLog');
const { Parser } = require('json2csv');

exports.getLogs = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filter = {};
    if (req.query.riskLevel) filter.riskLevel = req.query.riskLevel;

    const [logs, total] = await Promise.all([
      ScanLog.find(filter).sort({ timestamp: -1 })
        .skip((page - 1) * limit).limit(limit).lean(),
      ScanLog.countDocuments(filter)
    ]);

    res.json({ logs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

exports.deleteLog = async (req, res, next) => {
  try {
    await ScanLog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Log deleted' });
  } catch (err) {
    next(err);
  }
};

exports.exportCSV = async (req, res, next) => {
  try {
    const logs = await ScanLog.find().sort({ timestamp: -1 }).lean();
    const fields = ['url','riskLevel','riskScore','reasons','openPhishMatch','source','timestamp'];
    const csv = new Parser({ fields }).parse(
      logs.map(l => ({ ...l, reasons: l.reasons.join(' | ') }))
    );
    res.header('Content-Type', 'text/csv');
    res.attachment('phishguard-logs.csv');
    res.send(csv);
  } catch (err) {
    next(err);
  }
};
