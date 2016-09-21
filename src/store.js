const Redux = require("redux");
const {default: thunkMiddleware} = require("redux-thunk");
const loggerMiddleware = require("redux-logger")({logErrors: false});
const reducers = require("./reducers");

module.exports = function getStore(options = {}) {
  const middleware = [thunkMiddleware];

  if (options.logging) {
    middleware.push(loggerMiddleware);
  }

  return Redux.createStore(
    reducers,
    Redux.applyMiddleware(...middleware)
  );
};
