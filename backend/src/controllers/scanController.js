const { analyzeUrl }         = require('../services/urlAnalyzer');
const { checkVirusTotal }    = require('../services/virusTotalService');
const { isPhishing, refreshFeed } = require('../services/openPhishService');
const ScanLog                = require('../models/ScanLog');

exports.scanUrl = async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    await refreshFeed();
    const localResult = analyzeUrl(url);

    const openPhishMatch = isPhishing(url);
    if (openPhishMatch) {
      localResult.riskScore = Math.max(localResult.riskScore, 90);
      localResult.riskLevel = 'dangerous';
      localResult.reasons.unshift('Matched OpenPhish blacklist');
    }

    const vtResult = await checkVirusTotal(url);
    if (vtResult?.isMalicious) {
      localResult.riskScore = Math.max(localResult.riskScore, 85);
      localResult.riskLevel = 'dangerous';
      localResult.reasons.unshift(`VirusTotal: ${vtResult.malicious} engines flagged`);
    }

    const log = await ScanLog.create({
      url,
      riskLevel:        localResult.riskLevel,
      riskScore:        localResult.riskScore,
      reasons:          localResult.reasons,
      source:           req.body.source || 'dashboard',
      virusTotalResult: vtResult,
      openPhishMatch,
      scannedBy:        req.user?.id || null
    });

    res.json({
      url,
      riskScore:      localResult.riskScore,
      riskLevel:      localResult.riskLevel,
      reasons:        localResult.reasons,
      virusTotal:     vtResult,
      openPhishMatch,
      logId:          log._id,
      timestamp:      log.timestamp
    });
  } catch (err) {
    next(err);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [total, safe, suspicious, dangerous] = await Promise.all([
      ScanLog.countDocuments(),
      ScanLog.countDocuments({ riskLevel: 'safe' }),
      ScanLog.countDocuments({ riskLevel: 'suspicious' }),
      ScanLog.countDocuments({ riskLevel: 'dangerous' })
    ]);
    const recent = await ScanLog.find().sort({ timestamp: -1 }).limit(10).lean();
    res.json({ total, safe, suspicious, dangerous, recent });
  } catch (err) {
    next(err);
  }
};
