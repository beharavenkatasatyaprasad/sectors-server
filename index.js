const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;
app.use(cors());
app.use(bodyParser.json());

app.post('/api/formData', (req, res) => {});

app.get('/api/formData', (req, res) => {});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
