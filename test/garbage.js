import fritz from "../window.mjs";
import { waitForMount } from "./helpers.js";

let garbageEl;

QUnit.module("Garbage collection", {
  async before() {
    fritz.use(new Worker("./garbage/app.js", { type: "module" }));
    garbageEl = document.createElement("gc-app");
    document.body.append(garbageEl);
    await waitForMount(garbageEl);
  },
  after() {
    garbageEl.remove();
  },
});

QUnit.test("Triggering a render gives 2 handles", (assert) => {
  let done = assert.async();
  let shadow = garbageEl.shadowRoot;
  let btn = shadow.querySelector("#increment");
  let sizeSpan = shadow.querySelector("#handleSize");

  btn.dispatchEvent(new Event("click"));

  setTimeout(function () {
    assert.equal(sizeSpan.textContent, "2");

    // Now trigger another.
    btn.dispatchEvent(new Event("click"));
    setTimeout(function () {
      assert.equal(sizeSpan.textContent, "2", "still is 2");

      done();
    }, 60);
  }, 60);
});
