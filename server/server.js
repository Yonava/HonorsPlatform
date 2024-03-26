const http = require('http');
const express = require('express');
const cors = require('cors');

const authAPI = require('./api/auth.js');
const sheetsAPI = require('./api/sheets.js');
const userAPI = require('./api/user.js');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authAPI);
app.use('/api/sheets', sheetsAPI);
app.use('/api/user', userAPI);

const server = http.createServer(app);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(__dirname + '/public/'));
  app.get(/.*/, (req, res) => res.sendFile(__dirname + '/public/index.html'));
}

const port = process.env.PORT || 1010;

server.listen(port, () => {
  console.log("Rest endpoints listening on port " + port);
});

module.exports = { server };