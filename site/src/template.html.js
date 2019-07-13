
module.exports = function({ shim, body }) {
  return /* html */ `
    <!doctype html>
    <html lang="en">
    <title>Fritz app</title>
    <meta charset="utf-8">
    <script>${shim}</script>
    <script>APP = new Worker('./app.js');</script>
    <script type="module" src="./window.js"></script>

    ${body}
  `;
};