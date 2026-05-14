const { Schema, model } = require('mongoose');

const ScanLogSchema = new Schema({
  url:              { type: String, required: true },
  riskLevel:        { type: String, enum: ['safe','suspicious','dangerous'], required: true },
  riskScore:        { type: Number, min: 0, max: 100 },
  reasons:          [{ type: String }],
  source:           { type: String, enum: ['extension','dashboard','api'] },
  virusTotalResult: { type: Object },
  openPhishMatch:   { type: Boolean },
  scannedBy:        { type: Schema.Types.ObjectId, ref: 'User' },
  timestamp:        { type: Date, default: Date.now }
});

module.exports = model('ScanLog', ScanLogSchema);
