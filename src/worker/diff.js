import { VNode, VFrag } from './vnode.js';
import Handle from './handle.js';
import { INSERT, REMOVE, REPLACE, SET_ATTR, RM_ATTR, EVENT, TEXT } from '../bc.js';

const enc = new TextEncoder();

function* encodeString(str) {
  yield* enc.encode(str);
  yield 0;
}

function diff(oldTree, newTree, instance) {
  let tree = newTree;
  if(newTree instanceof VNode) {
    tree = new VFrag();
    tree.children = [newTree];
  }

  return Uint16Array.from(idiff(oldTree, tree, 0, {id:0}, null, instance));
}

function* idiff(oldNode, newNode, parentId, id, index, instance, orphan) {
  let out = oldNode;
  let thisId = id.id;

  if(typeof newNode === 'string') {
    if(!oldNode) {
      out = new VNode();
      out.nodeValue = newNode;
      out.type = 3;

      if(orphan) {
        yield REPLACE;
        yield parentId;
        yield index;
        yield 3;
        yield* encodeString(newNode);
      } else {
        yield INSERT;
        yield parentId;
        yield index;
        yield 3; // NodeType
        yield* encodeString(newNode);
      }
    } else if(!oldNode.nodeValue) {
      throw new Error('Do not yet support replacing a node with a text node');
    } else if(oldNode.nodeValue === newNode) {
      return oldNode;
    } else {
      oldNode.nodeValue = newNode;

      yield TEXT;
      yield thisId;
      yield* encodeString(newNode);
    }

    return out;
  }

  let vnodeName = newNode.nodeName;
  if(!oldNode || false) {
    out = new VNode();
    out.nodeName = vnodeName;
    out.type = 1;

    yield INSERT;
    yield parentId;
    yield index;
    yield 1;
    yield* encodeString(vnodeName);

    if(oldNode) {
      throw new Error('Move stuff around');
    }
  }

  // TODO fast pass strings

  // TODO fast pass one child

  // Children
  if(newNode.children && newNode.children.length) {
    yield* innerDiffNode(out, newNode, id, instance);
  }

  // Props
  yield* diffProps(out, newNode, thisId, instance);

  return out;
}

function* innerDiffNode(oldNode, newNode, id, instance) {
  let aChildren = oldNode.children && Array.from(oldNode.children),
    bChildren = newNode.children && Array.from(newNode.children),
    children = [],
    keyed = {},
    keyedLen = 0,
    aLen = aChildren && aChildren.length,
    blen = bChildren && bChildren.length,
    childrenLen = 0,
    min = 0,
    parentId = id.id,
    j, c, f, child, vchild;
  
  if(aLen !== 0) {
    for(let i = 0; i < aLen; i++) {
      let child = aChildren[i],
      // TODO props
        props = {},
        key = blen && props ? props.key : null;

      if(key != null) {
        keyedLen++;
        keyed[key] = child;
      }
      else if(props || true) {
        children[childrenLen++] = child;
      }
    }
  }

  if(blen !== 0) {
    for(let i = 0; i < blen; i++) {
      vchild = bChildren[i];
      child = null;
      let key = vchild.key;

      if(key != null) {
        throw new Error('Keyed matching not yet supported.');
      }
      else if(min < childrenLen) {
        for(j = min; j < childrenLen; j++) {
          if(children[j] !== undefined && isSameNodeType(c = children[j], vchild)) {
            child = c;
            children[j] = undefined;
            if(j === childrenLen -1) childrenLen--;
            if(j === min) min++;
            break;
          }
        }
      }

      id.id++;
      f = aChildren && aChildren[i];
      child = yield* idiff(child, vchild, parentId, id, i, instance, f);
      
      if(child && child !== oldNode && child !== f) {
        // TODO This should put stuff into place
        if(f == null) {
          if(!oldNode.children) {
            oldNode.children = [child];
          } else {
            oldNode.children.push(child);
          }
        }
        // Is nextSibling
        else if(false) {

        }
        // splice into
        else {
          //oldNode.remove(f);
          //oldNode.insertBefore(child, f);
        }
      }
  
      //if(min < )
    }
  }

  // remove orphaned unkeyed children:
	/*while (min<=childrenLen) {
		if ((child = children[childrenLen--])!==undefined) yield* recollectNodeTree(child, oldNode, parentId);
	}*/
}

function* diffProps(oldNode, newNode, parentId, instance) {
  let name;
  let oldProps = oldNode.props;
  let newProps = newNode.props;

  // Remove props no longer in new props
  if(oldProps) {
    for(name in oldProps) {
      if(!(newProps && newProps[name] != null) && (oldProps && oldProps[name] != null)) {
        delete oldProps[name];
        yield RM_ATTR;
        yield id.id;
        yield* encodeString(name);
      }
    }
  }

  if(newProps) {
    if(!oldProps) {
      oldProps = oldNode.props = {};
    }

    for(name in newProps) {
      if(!(name in oldProps) || newProps[name] !== oldProps[name]) {
        let value = newProps[name];
        oldProps[name] = value;

        if(typeof value === 'function') {
          yield EVENT;
          yield parentId;
          yield* encodeString(name.toLowerCase());
          
          let handle = Handle.from(value);
          handle.inUse = true;
          instance._fritzHandles.set(handle.id, handle);
          yield handle.id;
        } else {
          yield SET_ATTR;
          yield parentId;
          yield* encodeString(name);
          yield* encodeString(value);
        }
      }
    }
  }
}

function isSameNodeType(aNode, bNode) {
  if(typeof bNode === 'string') {
    return aNode.type === 3;
  }
  return aNode.nodeName === bNode.nodeName;
}

function* recollectNodeTree(node, parent, parentId) {
  let index = parent.children.indexOf(node);
  parent.children.splice(index, 1);
  yield REMOVE;
  yield parentId;
  yield index;
}

export { diff };