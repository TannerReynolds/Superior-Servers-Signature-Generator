/* eslint-disable global-require */
/* eslint-disable no-console */
const SignatureGenerator = require(`${__dirname}/server/signatureGenerator`);
/** Setting definitions for the config file and server class */
let c;
let server;
console.log('Booting...');

/** Determines whether or not to use the test config or not.
 * Test env config does not get pushed to git
 * @returns {void}
 */
async function loadConfig() {
    process.argv[2] === '-test'
        ? c = require(`${__dirname}/config.real.json`)
        : c = require(`${__dirname}/config.json`);
}

loadConfig().then(() => {
    /** Starting server using the selected config file */
    server = new SignatureGenerator(c);
});
process.on('SIGINT', async () => {
    server.log.warning('Gracefully exiting..');
    process.exit();
});

process.on('unhandledRejection', async err => console.log(err.stack));
process.on('uncaughtException', async err => console.log(err.stack));