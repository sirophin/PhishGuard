const axios = require('axios');

async function checkVirusTotal(url) {
  try {
    const submitRes = await axios.post(
      'https://www.virustotal.com/api/v3/urls',
      `url=${encodeURIComponent(url)}`,
      {
        headers: {
          'x-apikey': process.env.VIRUSTOTAL_API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    const analysisId = submitRes.data.data.id;
    const resultRes = await axios.get(
      `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
      { headers: { 'x-apikey': process.env.VIRUSTOTAL_API_KEY } }
    );
    const stats = resultRes.data.data.attributes.stats;
    return {
      malicious:   stats.malicious  || 0,
      suspicious:  stats.suspicious || 0,
      harmless:    stats.harmless   || 0,
      undetected:  stats.undetected || 0,
      isMalicious: (stats.malicious || 0) > 2
    };
  } catch (err) {
    console.error('VirusTotal error:', err.message);
    return null;
  }
}

module.exports = { checkVirusTotal };
