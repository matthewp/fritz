import { PatchOp } from './diff/patch-op.js';

let globalIndex;
let currentPatch;
let currentNode;
let currentParent;

function startPatch(node) {
  currentNode = node;
  currentPatch = new PatchOp();
  globalIndex = 0;
}

function getPatch() {
  return currentPatch;
}

function stopPatch() {
  let patch = getPatch();
  currentNode = null;
  currentPatch = null;
  currentParent = null;
  globalIndex = 0;
  return patch;
}

function getNextNode() {
  if(currentNode) {

  } else {

  }
}

function nextNode() {
  currentNode = getNextNode();
}

function open(nameOrCtor, key) {
  nextNode();
}

export {
  startPatch,
  stopPatch,

  open
};
