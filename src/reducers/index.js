const Redux = require("redux");

module.exports = Redux.combineReducers({
  elementRules: require("./element-rules").update,
});
