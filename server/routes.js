'use strict';
require('isomorphic-fetch');
const path = require('path');
const config = require('./config');

module.exports = function routes(app) {
  app.get('/api/sl/closestLocation', (req, res) => {
    const { lat, long } = req.query;
    const key = config.sl.key;
    const url = `http://api.sl.se/api2/nearbystops.json?key=${key}&originCoordLat=${lat}&originCoordLong=${long}&maxresults=1&radius=1000`;
    fetch(url)
      .then((response) => response.json())
      .then((json) => res.json(json))
      .catch((err) => res.json(err));
  });

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
  });
};
