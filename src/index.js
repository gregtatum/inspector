const React = require("react");
const ReactDOM = require("react-dom");
const {Provider} = require("react-redux");
const createStore = require("./store.js");
const app = React.createElement(require("./components/app"))

;(function main() {
  const store = createStore({logging: true});
  const reduxApp = React.createElement(Provider, {store}, app);
  ReactDOM.render(reduxApp, document.querySelector("#app"));
})();
