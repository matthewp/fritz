import fritz from "../window.mjs";
import { waitForMount } from "./helpers.js";

let app;

QUnit.module("Basics", {
  async before() {
    let worker = new Worker("./basics/app.js", { type: "module" });
    fritz.use(worker);
    app = document.createElement("basic-app");
    document.body.append(app);
    await waitForMount(app);
  },
  after() {
    app.remove();
    app = null;
  },
});

QUnit.test("Renders the initial page", (assert) => {
  let div = app.shadowRoot.querySelector("#root");
  assert.equal(div.textContent, "Hello world!");
});

QUnit.test("Renders subelements using the constructor", (assert) => {
  let nested = app.shadowRoot.querySelector("another-el");
  assert.ok(nested, "The nested element was rendered");

  let inner = nested.shadowRoot.firstChild;
  assert.equal(inner.textContent, "Another el");
});

QUnit.test("Renders hyperscript that uses numbers", (assert) => {
  let mathel = app.shadowRoot.querySelector("math-el");
  let inner = mathel.shadowRoot.firstChild;
  assert.equal(inner.textContent, "15 of 15");
});

QUnit.test("renders svg", (assert) => {
  let loading = app.shadowRoot.querySelector("loading-indicator");
  let svg = loading.shadowRoot.firstChild;
  assert.ok(svg.hasAttribute("viewBox"), "has the viewBox");
});

QUnit.test("renders children that are numbers", (assert) => {
  let root = app.shadowRoot;
  let el = root.querySelector("typed-el").shadowRoot;
  let val = el.querySelector(".c-number").firstChild.nodeValue;
  assert.equal(val, "27", "printed the string 27");
});

QUnit.test("renders children that are booleans", (assert) => {
  let root = app.shadowRoot;
  let el = root.querySelector("typed-el").shadowRoot;
  let val = el.querySelector(".c-boolean").firstChild.nodeValue;
  assert.equal(val, "false", "printed the string false");
});

QUnit.test("renders fragments", (assert) => {
  let root = app.shadowRoot;
  let el = root.querySelector("frag-el").shadowRoot;

  assert.ok(el.querySelector("#one"), "an element");
  assert.ok(el.querySelector("#two"), "another el");
  assert.ok(el.querySelector("#three"), "a nested fragment");
});
