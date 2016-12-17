export default function(url, method = 'GET', el, ev){
  let body;
  let toQueryParams = method === 'GET';

  switch(el.tagName) {
    case 'FORM':
      body = serializeForm(el, toQueryParams);
      break;
    default:
      break;
  }

  if(toQueryParams && body) {
    url += body;
    body = undefined;
  }

  url = new URL(url, location);

  return {
    url: url+'',
    method,
    body
  };
};

function serializeForm(form, toQueryParams){
  var el;
  return serializeBody(toQueryParams, function(cb){
    for(var i = 0, len = form.elements.length; i < len; i++) {
      el = form.elements[i];
      cb(el.name, el.value);
    }
  });
}

function serializeBody(toQueryParams, fn) {
  let body = toQueryParams ? '?' : Object.create(null);
  function addToBody(key, val) {
    if(toQueryParams) {
      body += (body.length > 1 ? '&' : '') + key + '=' + val;
    } else {
      body[key] = val;
    }
  }
  fn(addToBody);
  return body;
}
