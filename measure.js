const axios = require('axios');
const fs = require('fs');
const timings = [];

async function awaitSuccess() {
  while (true) {
    try {
      await axios.get('https://mttr-test.factset.io');
      break;
    } catch(err) {}
  }
}

async function killService() {
  await axios.post('https://mttr-test.factset.io/die');
}

(async function main() {
  for (let i = 0; i < 100; i++) {
    // Ensure that our service is up and responding before each iteration of the test
    await awaitSuccess();
    await killService();

    const start = process.hrtime();

    // Wait for it to come back up
    await awaitSuccess();

    const end = process.hrtime(start);

    console.log('Iteration', i, 'took', end[0], 'seconds to respond');
    timings.push(end[0]);
  }

  fs.writeFileSync('timings.json', JSON.stringify(timings, null, 2));
}());

