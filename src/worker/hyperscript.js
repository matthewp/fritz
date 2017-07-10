import { isFunction } from '../util.js';
import signal from './signal.js';
import { createTree, isTree } from './tree.js';
import { stringToByteArray } from './bytes.js';
import { AttrKey, AttrValue } from './opcodes.js';

export default function h(tag, attrs, children){
  const argsLen = arguments.length;
  if(argsLen === 2) {
    if(typeof attrs !== 'object' || Array.isArray(attrs)) {
      children = attrs;
      attrs = null;
    }
  } else if(argsLen > 3 || isTree(children) ||
    typeof children === 'string') {
    children = Array.prototype.slice.call(arguments, 2);
  }

  let isFn = isFunction(tag);

  if(isFn) {
    let localName = tag.prototype.localName;
    if(localName) {
      return h(localName, attrs, children);
    }

    return tag(attrs || {}, children);
  }

  var tree = createTree();
  var uniq;
  let attrsSize = 0;
  if(attrs) {
    var evs;
    attrs = Object.keys(attrs).reduce(function(acc, key){
      var value = attrs[key];

      var eventInfo = signal(tag, key, value, attrs)
      if(eventInfo) {
        if(!evs) evs = [];
        evs.push(eventInfo);
      } else if(key === 'key') {
        uniq = value;
      } else {
        //acc.push(key);
        //acc.push(value);

        let keyLen = key.length;
        let attrSize = keyLen;
        let valueType = typeof value;
        switch(valueType) {
          case 'string':
            attrSize += value.length;
            break;
          case 'number':
            attrSize += 1;
            break;
          default:
            throw new Error(`Serializing '${valueType}' is not supported.`);
        }

        attrsSize += attrSize;
        acc.push(function(array){
          // do stuff
          array[0] = AttrKey;
          stringToByteArray(array, 1, key);
          let valueOffset = 2 + keyLen;
          switch(valueType) {
            case 'string':
              stringToByteArray(array, valueOffset, value);
              break;
            case 'number':
              array[valueOffset] = value;
              break;
            default:
              // TODO
              break;
          }
          return attrSize;
        });
      }

      return acc;
    }, []);
  }

  var open = [1, tag, uniq];
  if(attrs) {
    //open.push(attrs);
  }
  if(evs) {
    open.push(evs);
  }
  tree.push(open);

  if(children) {
    children.forEach(function(child){
      if(typeof child !== 'undefined' && !Array.isArray(child)) {
        tree.push([4, child + '']);
        return;
      }

      while(child && child.length) {
        tree.push(child.shift());
      }
    });
  }

  let tagSize = tag.length + 1;
  let bufferSize = tagSize + attrsSize;

  if(attrsSize) {
    debugger;
  }

  let buffer = new ArrayBuffer(bufferSize);
  let tagArray = new Uint8Array(buffer, 0, tagSize);
  stringToByteArray(tagArray, 0, tag);

  if(attrs) {
    let attrsOffset = tagSize;
    let attrsArray = new Uint8Array(buffer, attrsOffset, attrsSize);
    attrs.forEach(function(fn){
      attrsOffset += fn(attrsArray);
    });
  }


  tree.push([2, tag]);

  return tree;
};
