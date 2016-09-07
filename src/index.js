const React = require('react')
const ReactDOM = require('react-dom')
const { Provider } = require("react-redux")
const Redux = require("redux")
const {default: thunkMiddleware} = require('redux-thunk')
const loggerMiddleware = require('redux-logger')({logErrors: false})

const reducers = require("./reducers")
const app = React.createElement(require('./components/app'))

;(function main () {
  // Start the main component
  const store = Redux.createStore(
    reducers,
    Redux.applyMiddleware(thunkMiddleware, loggerMiddleware)
  )

  const reduxApp = React.createElement(Provider, { store }, app);

  ReactDOM.render(reduxApp, document.querySelector("#app"));
})()
