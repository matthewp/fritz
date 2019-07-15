import html from './html.js';
import hljs from './highlight.pack.js';

const isNode = typeof process !== 'undefined' && Object.prototype.toString.call(global.process) === '[object process]';

debugger;

hljs.configure({ useBR: true });

const entities = /(&lt;|&gt;|\n)/g;
const LESS_THAN = '&lt;';
const GREATER_THAN = '&gt;';
const NEW_LINE = '\n';
const entityMap = {
  [LESS_THAN]: '<',
  [GREATER_THAN]: '>',
  [NEW_LINE]: '<br />'
};

function clean(value) {
  let strings = [], values = [];
  let res;

  let start = 0;

  while(res = (entities.exec(value))) {
    let [ match ] = res;
    let { index } = res;
    let entityValue = entityMap[match];
    let matchLength = match.length;

    let indexLength = index - start;
    let string = value.substr(start, indexLength);
    
    if(match === NEW_LINE) {
      string = string + entityValue;
      entityValue = '';
    }

    strings.push(string);
    values.push(entityValue);

    start = index + matchLength;
  }

  // Push the final string.
  strings.push(value.substr(start));

  return [strings, values];
}

export default function(code, lang) {
  const result = hljs.highlightAuto(code.trim(), [lang]);
  let { value } = result;

  if(code.includes('HelloMessage')) {
    debugger;
  }
  

  let [strings, values] = clean(value);

  return html(strings, ...values);
}