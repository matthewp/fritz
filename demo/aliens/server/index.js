const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();

app.use(express.static(__dirname + '/..'));

app.get('/api/details/:ids', function(req, res){
  let ids = req.params.ids;
  let url = `http://avp.wikia.com/api/v1/Articles/Details?ids=${ids}&abstract=0&width=180&height=180`;

  fetch(url).then(res => res.json()).then(json => {
    res.send(json);
  });
});

app.get('/article/:id', function(req, res){
  let pth = path.join(__dirname + '/../index.html');
  console.log('sending', pth);
  res.sendFile(pth);
});

app.listen(8080);
console.log(`Server running on http://localhost:8080`);
