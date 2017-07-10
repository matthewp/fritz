
export function stringToByteArray(array, offset, string) {
  var i = 0, len = string.length;
  array[offset] = len;
  offset++;
  while(i < len) {
    var c = string.charCodeAt(i);
    array[offset] = c;
    offset++;
    i++;
  }
};