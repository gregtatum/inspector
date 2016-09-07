const {DOM, createClass, createFactory} = require("react");
const {input} = DOM;
const Rule = createFactory(require('./rule'));
const noop = () => {};

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
  },

  getInitialState() {
    return {
      blurredByKeyDown: false
    }
  },

  blurByKeyDown() {
    this.setState({
      blurredByKeyDown: true
    })
  },

  handleKeyPress(event) {
    const {
      discardChanges,
      editNext,
      editPrevious,
      stopEditing
    } = this.props.commands;

    const commitChanges = this.valueChanged()
      ? this.props.commands.commitChanges
      : noop;

    const value = this._input.value;

    switch (event.key) {
      case "Tab":
        event.preventDefault();
        commitChanges(value);
        event.shiftKey ? editPrevious() : editNext();
        break;
      case "Enter":
        commitChanges(value);
        editNext();
        break;
      case "Escape":
        stopEditing();
        break;
    }
  },

  valueChanged() {
    return this._input !== this.props.defaultValue;
  },

  render() {
    const {
      className,
      defaultValue,
      commands
    } = this.props;
    const {blurredByKeyDown} = this.state;

    return input({
      className,
      defaultValue,
      ref: input => this._input = input,
      onBlur: blurredByKeyDown ? null : commands.discardChanges,
      onKeyDown: this.handleKeyPress
    });
  }
});

module.exports = NavigatableInput;
