const React = require("react");
const ReactDOM = require("react-dom");
const {Provider} = require("react-redux");
const store = require("./store.js");
const app = React.createElement(require("./components/app"))

;(function main() {
  const reduxApp = React.createElement(Provider, {store: store()}, app);
  ReactDOM.render(reduxApp, document.querySelector("#app"));
})();
