const {mockCssStyleSheet} = require("../utils");

const styleSheetText1 = `
  .page-container {
    background-color:#fff;
    top: 0;
    left: 0;
    right: 40%;
    bottom: 0;
    position: absolute;
  }

  .page-container > * {
    float: left;
    width: 50px;
    height: 50px;
    background-color:#333;
    margin: 1em;
  }

  .red-box {
    background-color:#f00;
  }

  .blue-box {
    background-color:#04f;
  }
`;

const styleSheetText2 = `
  body {
    font-size: 100px;
  }
`;

const mockCssStyleSheet1 = Object.freeze(mockCssStyleSheet(styleSheetText1));
const mockCssStyleSheet2 = Object.freeze(mockCssStyleSheet(styleSheetText2));

module.exports = {
  styleSheetText1,
  styleSheetText2,
  mockCssStyleSheet1,
  mockCssStyleSheet2
};
