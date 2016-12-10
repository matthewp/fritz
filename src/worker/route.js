import pathtoRegexp from 'path-to-regexp';

var decodeURLComponents = true;
function decodeURLEncodedURIComponent(val) {
  if (typeof val !== 'string') { return val; }
  return decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val;
}

class Route {
  constructor(path, options) {
    options = options || {};
    this.path = (path === '*') ? '(.*)' : path;
    this.method = options.method === undefined ? 'GET' : options.method;
    this.regexp = pathtoRegexp(this.path,
      this.keys = []
      /*options*/);
  }

  isMatch(method, path) {
    if(this.method !== method) return false;

    var qsIndex = path.indexOf('?'),
      pathname = ~qsIndex ? path.slice(0, qsIndex) : path,
      m = this.regexp.exec(decodeURIComponent(pathname));

    return m;
  }

  match(method, path, params) {
    let m = this.isMatch(method, path);
    if(!m) return false;

    var keys = this.keys;
    for (var i = 1, len = m.length; i < len; ++i) {
      var key = keys[i - 1];
      var val = decodeURLEncodedURIComponent(m[i]);
      if (val !== undefined || !(hasOwnProperty.call(params, key.name))) {
        params[key.name] = val;
      }
    }

    return true;
  }

  middleware(fn) {
    return (req, res, next) => {
      if (this.match(req.method, req.url.pathname, req.params)) {
        return fn(req, res, next);
      }
      next();
    };
  }
}

export default Route;
