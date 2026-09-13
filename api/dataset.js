let datasetPayload = null;
try {
  datasetPayload = require('../data/debernardi_dataset.json');
} catch (e) {
  datasetPayload = { success: false, error: 'Dataset load error: ' + e.message };
}

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (datasetPayload && datasetPayload.success) {
    return res.status(200).json(datasetPayload);
  }
  return res.status(500).json(datasetPayload || { success: false, error: 'Dataset unavailable' });
};
