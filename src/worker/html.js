
function html(fritz, strings, ...values) {
  return templateDefined(fritz, strings) ?
    createResult(values) :
    createResult(values, strings);
}

function templateDefined(fritz, strings) {
  let templates = fritz._templates;
  return templates.has(strings);
}

function createResult(values, strings) {
  let result = Object.create(null);
  result.values = values;
  if(strings) {
    result.type = 1;
    result.strings = strings;
  } else {
    result.type = 2;
  }
}

export default html;
