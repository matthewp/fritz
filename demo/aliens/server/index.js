const express = require('express');
const api = require('./api');
const fetch = require('node-fetch');
const path = require('path');
const templates = require('./templates');
const idomToString = require('../../../to-string');
const app = express();

const {
  index: indexTemplate,
  search: searchTemplate,
  article: articleTemplate
} = templates;

const ids = [
  1443, // xenomorph
  8459, // predator
  1758, // engineer
  1754, // facehugger
  11254 // predalien
];

app.get('/api/details/:ids', function(req, res){
  let ids = req.params.ids;
  api.details(ids).then(json => res.send(json));
});

app.get('/api/article/:id', function(req, res){
  let id = req.params.id;
  api.article(id).then(result => res.send(result));
});

app.get('/', function(req, res){
  api.details(ids)
  .then(data => {
    let species = Object.keys(data.items).map(id => data.items[id]);
    let bc = indexTemplate(species, { species });
    let html = idomToString(bc);
    res.type('html').end(html);
  })
  .catch(err => {
    res.status(500).end(err);
  });
});

app.get('/article/:id', function(req, res){
  let id = req.params.id;

  api.article(id)
  .then(data => {
    let bc = articleTemplate(data, { articleData: data });
    let html = idomToString(bc);
    res.type('html').end(html);
  })
  .catch(err => {
    console.log(err);
    res.status(500).end(err);
  });
});

app.get('/search', function(req, res){
  let q = req.query.q;

  api.details(ids)
  .then(data => {
    let species = Object.keys(data.items).map(id => data.items[id]);
    let bc = searchTemplate(species, q, { species });
    let html = idomToString(bc);
    res.type('html').end(html);
  })
  .catch(err => {
    console.log(err);
    res.status(500).end(err);
  });
});

app.use(express.static(__dirname + '/..'));

app.listen(8080);
console.log(`Server running on http://localhost:8080`);
