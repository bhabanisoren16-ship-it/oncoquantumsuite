const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const jsonPath = path.join(__dirname, 'dataset.json');
    if (fs.existsSync(jsonPath)) {
      const data = fs.readFileSync(jsonPath, 'utf-8');
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(data);
    }
    return res.status(404).json({ success: false, error: 'Dataset not found' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
