const express = require("express");

const port = process.env.PORT || 4000;
const app = express();

require('./bot');

app.get('/', (request, response) => {
  response.send('The bot is running!');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

// Export the Express API
module.exports = app;