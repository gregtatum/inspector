const {DOM, createClass} = require("react");
const {input} = DOM;

// There is probably a better way to do this:
const FONT_WIDTH_RATIO = 0.66;

/**
 * Exit cases:
 *
 *   Shift-Tab      -> commit, edit previous
 *   Tab            -> commit, edit next
 *   Enter          -> commit, edit next
 *   Exit character -> commit, edit next
 *   onBlur         -> commit
 *   Escape         -> reject
 */

const NavigatableInput = createClass({
  displayName: "NavigatableInput",

  componentDidMount() {
    this._input.focus();
    this._input.select();
    this.setInputWidth();
  },

  setInputWidth() {
    const {fontSize} = window.getComputedStyle(this._input);
    const numberCharacters = this._input.value.length;
    const width = numberCharacters * parseInt(fontSize, 10) * FONT_WIDTH_RATIO;
    this.setState({width});
  },

  getInitialState() {
    return {width: 0};
  },

  handleKeyDown(event) {
    const {
      commitOn,
      commands: {
        editNext,
        editPrevious,
        stopEditing,
      }
    } = this.props;

    switch (event.key) {
      case "Tab":
        event.preventDefault();
        this.commitAnyChanges();
        event.shiftKey ? editPrevious() : editNext();
        break;
      case "Enter":
        this.commitAnyChanges();
        editNext();
        break;
      case ":":
      case ";":
        // Don't allow these characters to get placed in the input.
        event.preventDefault();
        break;
      case "Escape":
        stopEditing();
        break;
    }

    if (commitOn === event.key) {
      this.commitAnyChanges();
      editNext();
    }
  },

  commitAnyChanges() {
    if (this._input.value !== this.props.defaultValue) {
      this.props.commands.commitChanges(this._input.value);
    }
  },

  render() {
    const {
      className,
      defaultValue,
      valuesPasted,
      commands: {
        stopEditing
      }
    } = this.props;

    return input({
      className,
      defaultValue,
      ref: element => {
        this._input = element;
      },
      onBlur: stopEditing,
      onKeyDown: this.handleKeyDown,
      onChange: this.setInputWidth,
      style: {width: this.state.width},
      onPaste: (e) => {
        if ([...e.clipboardData.types].includes("text/plain")) {
          valuesPasted(e.clipboardData.getData("text/plain"));
          stopEditing();
          e.preventDefault();
        }
      }
    });
  }
});

module.exports = NavigatableInput;
