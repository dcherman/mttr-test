const express = require('express');
const app = express();

app.get('/', (request, response) => {
  response.send('OK');
});

app.post('/die', (request, response) => {
  response.send('OK');

  response.on('finish', () => {
    process.exit(1);
  });
});

app.listen(process.env.PORT, () => {
  console.log('Listening on port', process.env.PORT);
});
