export default function(url, method = 'GET', el){
  let body;
  let toQueryParams = method === 'GET';

  switch(el.tagName) {
    case 'FORM':
      let result = serializeForm(el, toQueryParams);
      if(toQueryParams) {
        url += '?' + result;
      } else {
        body = result;
      }
      break;
    default:
      break;
  }
  url = new URL(url, location);

  return {
    url: url+"",
    method,
    body
  };
};

function serializeForm(form, toQueryParams){
  var out = toQueryParams ? '' : Object.create(null);
  var el;
  for(var i = 0, len = form.elements.length; i < len; i++) {
    el = form.elements[i];
    if(toQueryParams) {
      out += (out.length ? '&' : '') + el.name + '=' + el.value;
    } else {
      out[el.name] = el.value;
    }
  }
  return out;
}
