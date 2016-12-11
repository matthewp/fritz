const fetch = require('node-fetch');

exports.article = article;
exports.details = details;

function details(ids) {
  let url = `http://avp.wikia.com/api/v1/Articles/Details?ids=${ids}&abstract=0&width=180&height=180`;

  return fetch(url).then(toJson);
}

function article(id) {
  let detailsUrl = `http://avp.wikia.com/api/v1/Articles/Details?ids=${id}&abstract=0&width=180&height=180`;
  let articleUrl = `http://avp.wikia.com/api/v1/Articles/AsSimpleJson?id=${id}`;

  return Promise.all([
    fetch(detailsUrl).then(toJson),
    fetch(articleUrl).then(toJson)
  ]).then(([detail, article]) => {
    return { detail, article };
  });
}

function toJson(res) { return res.json() }
