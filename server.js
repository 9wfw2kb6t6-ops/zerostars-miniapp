const express = require('express');
const path = require('path');

const app = express();

app.get('/', (req, res) => {
res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/profile', (req, res) => {
res.json({
stars: 10,
energy: 99,
level: 1
});
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});

