import fritz from "../window.mjs";
import { waitForMount } from "./helpers.js";

fritz.use(new Worker("./props/app.js", { type: "module" }));
let helloEl;

QUnit.module("Properties", {
  async before() {
    helloEl = document.createElement("x-hello");
    helloEl.setAttribute("name", "world");
    document.body.append(helloEl);
    await waitForMount(helloEl);
  },
  after() {
    helloEl.remove();
  },
});

QUnit.test("Renders the provided props", (assert) => {
  let shadow = helloEl.shadowRoot;
  let span = shadow.firstChild;

  assert.equal(span.localName, "span");
  assert.equal(span.textContent, "Hello world");
});
