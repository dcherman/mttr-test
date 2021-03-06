const express = require('express');
const app = express();
const {createLightship} = require('lightship');

app.get('/', (request, response) => {
  response.send('OK');
});

app.post('/die', (request, response) => {
  response.send('OK');

  response.on('finish', () => {
    process.exit(1);
  });
});

const lightship = createLightship({
  port: 9000,
});

const server = app.listen(process.env.PORT || 8000, () => {
  lightship.signalReady();
  console.log('Ready to serve traffic');
});

lightship.registerShutdownHandler(() => {
  return new Promise((resolve, reject) => {
    server.close((err) => err ? reject(err) : resolve());
  });
});
