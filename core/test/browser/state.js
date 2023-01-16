import fritz from "../../window.mjs";
import { waitForMount } from "./helpers.js";

let statefulEl;

QUnit.module("fritz.state", {
  async before() {
    fritz.use(new Worker("./state/app.js", { type: "module" }));
    fritz.state = { name: "Matthew" };
    statefulEl = document.createElement("stateful-el");
    document.body.append(statefulEl);
    await waitForMount(statefulEl);
  },
  after() {
    statefulEl.remove();
  },
});

QUnit.test("Is available as fritz.state", (assert) => {
  let shadow = statefulEl.shadowRoot;
  let span = shadow.firstChild;

  assert.equal(span.localName, "span");
  assert.equal(span.textContent, "Hello Matthew");
});
