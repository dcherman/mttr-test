const axios = require('axios');
const fs = require('fs');
const yargs = require('yargs');

const argv = yargs.argv;

const ELEVEN_MINUTES = 1000 * 60 * 11;

if (!argv.skipInitialDelay) {
  argv.skipInitialDelay = false;
}

if (!argv.perRequestDelay) {
  argv.perRequestDelay = 500;
}

if (!argv.initialDelay) {
  argv.initialDelay = ELEVEN_MINUTES;
}

const RESULTS_FILE = `timings-${argv.instance}.json`;

async function awaitSuccess() {
  while (true) {
    try {
      console.log(Date.now(), 'Checking service health');
      await axios.get(`${argv.url}`);
      break;
    } catch(err) {
      if (err.response) {
        console.log(err.response.status, err.response.statusText);
      } else {
        console.log(err.message);
      }

      await sleep(argv.perRequestDelay);
    }
  }
}

async function killService() {
  await axios.post(`http://${argv.url}/die`);
}

function sleep(timeMs) {
  return new Promise((resolve) => setTimeout(resolve, timeMs));
}

if (!fs.existsSync(RESULTS_FILE)) {
  fs.writeFileSync(RESULTS_FILE, '[]');
}

const timings = JSON.parse(fs.readFileSync(RESULTS_FILE, {encoding: 'utf8'}));

async function runMttrTest() {
  const prefix = `[${argv.instance}] `;

  for (let i = 0; i < 17; i++) {
    // Ensure that our service is up and responding before each iteration of the test
    console.log(prefix, 'Waiting for the service to become available');
    await awaitSuccess();

    if (i > 0 || !argv.skipInitialDelay) {
      // Sleep for 11 minutes in order to avoid the backoff logic in the container
      console.log(prefix, 'Waiting 11 minutes to continue');
      await sleep(i === 0 ? argv.initialDelay : ELEVEN_MINUTES);
    }

    console.log(prefix, 'Killing the service');
    await killService();

    const start = process.hrtime();

    // Wait for it to come back up
    await awaitSuccess();

    const end = process.hrtime(start);

    console.log(prefix, 'Iteration', i, 'took', end[0], 'seconds to respond');

    timings.push(end[0]);

    fs.writeFileSync(RESULTS_FILE, JSON.stringify(timings, null, 2));
  }
}

(async function main() {
  await runMttrTest();
}());

