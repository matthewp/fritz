module.exports = function(bc) {
  var out = '';

  bc.forEach(function(instr){
    let tag, attrs;

    switch(instr[0]) {
      // open
      case 1:
        tag = instr[1];
        out += `<${tag}`;
        attrs = instr[2];
        if(attrs) {
          out += attributes(attrs);
        }
        out += '>';
        break;
      // close
      case 2:
        tag = instr[1];
        out += `</${tag}>`;
        break;
      // text
      case 4:
        out += instr[1];
        break;
    }
  });
  return out;
};

function attributes(arr) {
  var out = '';
  var i = 0, len = arr.length;
  var name, value;
  while(i < len) {
    name = arr[i];
    i++;
    value = arr[i];
    if(value === true) {
      out += ` ${name}`;
    } else {
      out += ` ${name}="${value}"`;
    }
    i++;
  }
  return out;
}
