// These are important and needed before anything else
import 'zone.js/dist/zone-node';
import 'reflect-metadata';
import * as express from 'express';
import {enableProdMode} from '@angular/core';

import {join} from 'path';
import {readFileSync} from 'fs';


enableProdMode();
const app = express();
const morgan = require('morgan');
const ObjectID = require('mongodb').ObjectID;
const path = require('path'),
  http = require('http'),
  bodyParser = require('body-parser'),
  api = require('./api');

const PORT = process.env.PORT || 3000;
const DIST_FOLDER = join(process.cwd() , 'dist');
console.log(DIST_FOLDER);
// Our index.html we'll use as our template
const template = readFileSync(join(DIST_FOLDER, 'browser', 'index.html')).toString();

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const {AppServerModuleNgFactory, LAZY_MODULE_MAP} = require('../../dist/server/main');


// Express Engine
import { ngExpressEngine } from '@nguniversal/express-engine';
// Import module map for lazy loading
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';
import {renderModuleFactory} from '@angular/platform-server';
import {APP_BASE_HREF} from '@angular/common';


export class ServerApp {

  public start(properties, db, logger) {

    app.engine('html', (_, options, callback) => {
      renderModuleFactory(AppServerModuleNgFactory, {
        // Our index.html
        document: template,
        url: options.req.url,
        // DI so that we can get lazy-loading to work differently (since we need it to just instantly render it)
        extraProviders: [
          provideModuleMap(LAZY_MODULE_MAP),
          {provide: APP_BASE_HREF, useValue: properties.serverBaseUri}
        ]
      }).then(html => {
        callback(null, html);
      });
    });

    app.set('view engine', 'html');
    app.set('views', join(DIST_FOLDER, 'browser'));


    app.use(function (req, res, next) {
      req.db = db;
      req.properties = properties;
      next();
    });

// Parsers for POST data
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));


// Point static path to dist
    app.use(express.static(path.join(__dirname, 'dist')));

    // use morgan to log api calls
    morgan.token('xff', function (req, res) { return req.headers['X-Forwarded-For'];
    });
    app.use(morgan(':remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms :xff',
      { 'stream': logger.stream }));

// Set our api routes
    app.use('/api', api);
// Server static files from /browser
app.get('*.*', express.static(join(DIST_FOLDER, 'browser')));

// All regular routes use the Universal engine
    app.get('*', (req, res) => {
      res.render('index', { req });
    });

// error handler
    app.use(function (err, req, res, next) {
      logger.error(err);
      res.status(500).send({error: err.message});
    });

    /**
     * Get port from environment and store in Express.
     */
    const port = process.env.PORT || properties.appListenPort || '3000';
    app.set('port', port);

    /**
     * Create HTTP server.
     */
    const server = http.createServer(app);

    /**
     * Listen on provided port, on all network interfaces.
     */

    server.listen(port, function () {
      logger.info('ad-hoc-mail service started!');
    });

// delete emails every interval
    setInterval(function () {
      logger.info('checking for emails older than ' + properties.emailDeleteAge + ' seconds');
      db.collection('emails').find({'timestamp': {$lt: (new Date().getTime() - (properties.emailDeleteAge * 1000))}},
        {'_id': 1}).toArray(function (err, emailsToDelete) {
        logger.info(emailsToDelete.length + ' emails with age > ' + properties.emailDeleteAge + ' seconds where found');
        emailsToDelete.forEach(email => {
          db.collection('accounts').update(
            {'emails.emailId': email._id},
            {$pull: {'emails': {'emailId': email._id}}},
            {'multi': true}
            , function (err1, numberRemoved) {
              if (err1) {
                logger.error(err1);
              }
              logger.info('Removing ' + email._id.toString()
                + ' has been removed from '
                + JSON.parse(numberRemoved).nModified + ' accounts.');

            }
          );

          db.collection('emails').remove({'_id': email._id}, function (err1, result) {
            if (err1) {
              logger.error(err1);
            } else {
              logger.info('Delete email', result.result);
            }
          });
        });
      });

      db.collection('accounts').remove({'emails': {$exists: true, $ne: '[]'}}, function (err, result) {
        if (err) {
          logger.error(err);
        } else {
          logger.info('Removed empty accounts', result.result);
        }
      });

    }, properties.emailDeleteInterval * 1000);

    logger.info('mail server listening');
  }
}
