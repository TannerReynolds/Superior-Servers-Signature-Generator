/* eslint-disable consistent-return */
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const routes = require(`${__dirname}/routes`);
const utils = require(`${__dirname}/../util`);
const https = require('https');
const helmet = require('helmet');

/** Express Webserver Class */
class SignatureGenerator {
    /**
   * Starting server and bot, handling routing, and middleware
   * @param {object} c - configuration json file
   */
    constructor(c) {
        /** Defintions */
        this.utils = utils;
        this.log = utils.log;
        this.c = c;
        this.app = app;
        this.app.use(helmet());
        this.app.use(bodyParser.json());


        // routing
        this.app.get('/sigs', routes.sigs.bind(this));

        // Begin server
        this.startServer();
    }

    /** Start's the Express server
   * @returns {void}
   */
    async startServer() {
        if (this.c.secure) {
        /** if the secure option is set to true in config,
         *  it will boot in https so long as it detects
         *  key.pem and cert.pem in the src directory
         */
            if (fs.existsSync(`${__dirname}/../key.pem`) && fs.existsSync(`${__dirname}/../cert.pem`)) {
                const privateKey = fs.readFileSync(`${__dirname}/../key.pem`);
                const certificate = fs.readFileSync(`${__dirname}/../cert.pem`);
                https.createServer({
                    key: privateKey,
                    cert: certificate,
                }, this.app).listen(this.c.securePort, '0.0.0.0');
            } else {
            // CF Flexible SSL or SSL handled by reverse proxy
            /** if no key & cert pem files are detected,
             * it will still run in secure mode (returning urls with https)
             * so that it's compatible with CF flexible SSL
             * and SSL configurations via a reverse proxy */
                this.app.listen(this.c.securePort, '0.0.0.0', () => {
                    this.log.warning('Server using flexible SSL secure setting\nTo run a full SSL setting, ensure key.pem and cert.pem are in the /src folder');
                });
            }
            this.log.success(`Secure server listening on port ${this.c.securePort}`);
        } else {
            this.app.listen(this.c.port, '0.0.0.0', () => {
                this.log.success(`Server listening on port ${this.c.port}`);
            });
        }
    }

    /** Checks to see if server administrator wants to return http or https
   * Using this function instead of req.secure because of
   * Certain possible SSL configurations (CF Flexible SSL)
   * @returns {string} http OR https
   */
    protocol() {
        if (this.c.secure) {
            return 'https';
        }
        return 'http';
    }
}

module.exports = SignatureGenerator;