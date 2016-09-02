'use strict';
require('isomorphic-fetch');
const path = require('path');
const jwt = require('jsonwebtoken');
const config = require('./config');

function authResponse(token) {
  const success = Boolean(token);
  return {
    success,
    message: `Authentication ${success ? 'successful' : 'failed'}`,
    token
  };
}

function authenticate(req, res, next) {
  const auth = req.headers.authorization && req.headers.authorization.split(' ');

  if (!auth || auth[0] !== 'Bearer') {
    return res.status(401).redirect('/login');
  }

  jwt.verify(auth[1], config.JWTsecret, (err, decoded) => {
    if (err) return res.status(401).json(err);
    req.decoded = decoded;
    next();
  });
}

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

  app.head('/login', (req, res) => {
    const auth = req.headers.authorization && req.headers.authorization.split(' ');

    if (!auth || auth[0] !== 'Bearer') {
      return res.status(401).json({ successful: false });
    }

    jwt.verify(auth[1], config.JWTsecret, (err, decoded) => {
      if (err) return res.status(401).json({ successful: false });
      res.json({ successful: true });
    });
  });

  app.get('/login', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public/login.html'));
  });

  app.post('/login', (req, res) => {
    console.log('body', req.body);
    const user = config.users.find((user) => user.username === req.body.user);

    if (!user || user.password !== req.body.pass) {
      return res.json(authResponse());
    }

    const token = jwt.sign(user, config.JWTsecret, config.JWToptions);
    res.json(authResponse(token));
  });

  app.get('/users', authenticate, (req, res) => {
    res.json(config.users.map((user) => user.username));
  });

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
  });
};
