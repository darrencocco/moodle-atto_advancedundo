YUI.add('moodle-atto_advancedundo_forthelulz-button', function (Y, NAME) {

// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * @component  atto_advancedundo_forthelulz
 * @copyright  2018 Leigh White
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * @module moodle-atto_undo-button
 */

/**
 * Atto text editor undo plugin.
 *
 * @namespace M.atto_advancedundo_forthelulz
 * @class button
 * @extends M.editor_atto.EditorPlugin
 */

Y.namespace('M.atto_advancedundo_forthelulz').Button = Y.Base.create('button', Y.M.editor_atto.EditorPlugin, [], {
    /**
     * The maximum saved number of undo steps.
     *
     * @property _maxUndos
     * @type {Number} The maximum number of saved undos.
     * @default 40
     * @private
     */
    _maxUndos: 40,

    /**
     * History of edits.
     *
     * @property _undoStack
     * @type {Array} The elements of the array are the html strings that make a snapshot
     * @private
     */
    _undoStack: null,

    /**
     * History of edits.
     *
     * @property _redoStack
     * @type {Array} The elements of the array are the html strings that make a snapshot
     * @private
     */
    _redoStack: null,

    /**
     * Add the buttons to the toolbar
     *
     * @method initializer
     */
    initializer: function() {
        // Initialise the undo and redo stacks.
        this._undoStack = [];
        this._redoStack = [];

        this.addButton({
            title: 'undo',
            icon: 'e/undo',
            callback: this._undoHandler,
            buttonName: 'undo',
            keys: 90
        });

        this.addButton({
            title: 'redo',
            icon: 'e/redo',
            callback: this._redoHandler,
            buttonName: 'redo',
            keys: 89
        });

        // Enable the undo once everything has loaded.
        this.get('host').on('pluginsloaded', function() {
            // Adds the current value to the stack.
            this._addToUndo(this._getHTML());
            this.get('host').on('atto:selectionchanged', this._changeListener, this);
        }, this);

        this._updateButtonsStates();
    },

    /**
     * Adds an element to the redo stack.
     *
     * @method _addToRedo
     * @private
     * @param {String} html The HTML content to save.
     */
    _addToRedo: function(html) {
        this._redoStack.push(html);
    },

    /**
     * Adds an element to the undo stack.
     *
     * @method _addToUndo
     * @private
     * @param {String} html The HTML content to save.
     * @param {Boolean} [clearRedo=false] Whether or not we should clear the redo stack.
     */
    _addToUndo: function(html, clearRedo) {
        var last = this._undoStack[this._undoStack.length - 1];

        if (typeof clearRedo === 'undefined') {
            clearRedo = false;
        }

        if (last !== html) {
            this._undoStack.push(html);
            if (clearRedo) {
                this._redoStack = [];
            }
        }

        while (this._undoStack.length > this._maxUndos) {
            this._undoStack.shift();
        }
    },

    /**
     * Get the editor HTML.
     *
     * @method _getHTML
     * @private
     * @return {String} The HTML.
     */
    _getHTML: function() {
        return this.get('host').getCleanHTML();
    },

    /**
     * Get an element on the redo stack.
     *
     * @method _getRedo
     * @private
     * @return {String} The HTML to restore, or undefined.
     */
    _getRedo: function() {
        return this._redoStack.pop();
    },

    /**
     * Get an element on the undo stack.
     *
     * @method _getUndo
     * @private
     * @param {String} current The current HTML.
     * @return {String} The HTML to restore.
     */
    _getUndo: function(current) {
        if (this._undoStack.length === 1) {
            return this._undoStack[0];
        }

        var last = this._undoStack.pop();
        if (last === current) {
            // Oops, the latest undo step is the current content, we should unstack once more.
            // There is no need to do that in a loop as the same stack should never contain duplicates.
            last = this._undoStack.pop();
        }

        // We always need to keep the first element of the stack.
        if (this._undoStack.length === 0) {
            this._addToUndo(last);
        }

        return last;
    },

    /**
     * Restore a value from a stack.
     *
     * @method _restoreValue
     * @private
     * @param {String} html The HTML to restore in the editor.
     */
    _restoreValue: function(html) {
        this.editor.setHTML(html);
        // We always add the restored value to the stack, otherwise an event could think that
        // the content has changed and clear the redo stack.
        this._addToUndo(html);
    },

    /**
     * Update the states of the buttons.
     *
     * @method _updateButtonsStates
     * @private
     */
    _updateButtonsStates: function() {
        if (this._undoStack.length > 1) {
            this.enableButtons('undo');
        } else {
            this.disableButtons('undo');
        }

        if (this._redoStack.length > 0) {
            this.enableButtons('redo');
        } else {
            this.disableButtons('redo');
        }
    },

    /**
     * Handle a click on undo
     *
     * @method _undoHandler
     * @param {Event} The click event
     * @private
     */
    _undoHandler: function(e) {
        e.preventDefault();
        var html = this._getHTML(),
            undo = this._getUndo(html);

        // Edge case, but that could happen. We do nothing when the content equals the undo step.
        if (html === undo) {
            this._updateButtonsStates();
            return;
        }

        // Restore the value.
        this._restoreValue(undo);

        // Add to the redo stack.
        this._addToRedo(html);

        // Update the button states.
        this._updateButtonsStates();
    },

    /**
     * Handle a click on redo
     *
     * @method _redoHandler
     * @param {Event} The click event
     * @private
     */
    _redoHandler: function(e) {
        e.preventDefault();
        var html = this._getHTML(),
            redo = this._getRedo();

        // Edge case, but that could happen. We do nothing when the content equals the redo step.
        if (html === redo) {
            this._updateButtonsStates();
            return;
        }
        // Need to ensure that what we are trying to redo is actual content -
        // in the case that Ctrl+Y is pressed after the end of the redo stack is empty/null then it won't have content!
        if (typeof redo === 'string') {
            // Restore the value.
            this._restoreValue(redo);
        }

        // Update the button states.
        this._updateButtonsStates();
    },

    /**
     * Read content from top of a stack (without popping)
     *
     * @method _filterMouseEvent
     * @param {Event} The change event
     * @private
     */
    _filterMouseEvent: function(e) {

        var event = e.event._event;

        // CANNOT detect the selection of a paragraph style from the drop down (button labelled i with dropdown)
        // Clicking the paragraph style button gives an event, however clicking a paragraph style option doesn't
        // give a click event, just a 'focus' (like every other action).
        // This also behaves weirdly in that initially, all 'focus' event.type have a value of 'focus'.
        // After the first time an option is clicked from the paragraph style menu, all subsequent
        // event.type have a value of 'focusoutside' !!

        var mouseEventState = {
            isMouseClick:false,
            isMouseClickInTextEditor:false,
            isMouseClickOnEditorButton:false,
            clickedEditorButtonClassname:''
        };

        mouseEventState.isMouseClick = (event.type == 'pointerup' && event.pointerType == 'mouse') ? true : false;
        mouseEventState.isMouseClickDeadSpace = false;      // true if click on the grey area around buttons
        mouseEventState.isMouseClickInTextEditor = false;
        mouseEventState.isMouseClickOnEditorButton = false;
        mouseEventState.clickedEditorButtonClassname = '';

        if (mouseEventState.isMouseClick) {

            // Detect where the mouse click occurred.
            // Chrome/Firefox (and to allow for potential other browser differences) return a different
            // element level within the element hierarchy from a mouse click. Therefore need to loop back
            // up through the nested path of html elements to detect what has actually been clicked
            var path = this._getElementPath(event.srcElement);
            var pathdepth = path.length;

            for ($i = 0; $i < pathdepth; $i++) {

                var elementClassName = path[$i].className;

                if (elementClassName.includes('editor_atto_content')) {
                    mouseEventState.isMouseClickInTextEditor = true;
                    break;
                } else if (path[$i].nodeName == "BUTTON" ) {
                    mouseEventState.isMouseClickOnEditorButton = true;
                    mouseEventState.clickedEditorButtonClassname = elementClassName;
                    break;
                } else if (elementClassName.includes('editor_atto_wrap')) {
                    mouseEventState.isMouseClickDeadSpace = true;
                    break;
                }
            }

        }

        return mouseEventState;
    },

    /**
     * Get array of all ancestor elements from a given html element
     *
     * @method _getElementPath
     * @param {el} html element
     * @private
     */
    _getElementPath: function(el) {

        var path = [];

        while (el) {

            path.push(el);

            if (el.tagName === 'HTML') {
                return path;
            }

            el = el.parentElement;
        }
    },

    /**
     * Indicates if both the redo button is active
     *
     * @method _redoButtonIsActive
     * @private
     */
    _redoButtonIsActive: function(e) {

        return (this._redoStack.length > 0);
    },

    /**
     * If we are significantly different from the last saved version, save a new version.
     *
     * @method _changeListener
     * @param {EventFacade} e - The click event
     * @private
     */
    _changeListener: function(e) {

        if (e.event == null) {
            return;
        }

        var mouseEventState = this._filterMouseEvent(e);

        var eventType = e.event.type;
        var keycode = e.event.keyCode;

        if (!this._redoButtonIsActive()) {
            // Only commit text to the undo stack on specific key presses and in-editor mouse clicks
            // to minimise performance issues that could occur with large amounts of text.
            var validkeyCodes = [
                8,                  // Backspace
                13,                 // Enter
                37, 38, 39, 40,     // arrow keys
                46,                 // Delete
                190                 // .
            ];

            var isCommitTextKey = (eventType == 'keyup' && validkeyCodes.indexOf(keycode) > -1) ? true : false;

            if (!isCommitTextKey && !mouseEventState.isMouseClickInTextEditor) {
                return;
            }

        } else {
            // Allowing any event through here as there is a possibility it could have caused a text edit
            // (thereby triggering the redo button to be disabled)
            // Ideally would only allow events of a specific type through (eg a key press or mouse click),
            // however the issue is with the paragraph style selector which does not register a mouse button click,
            // so we cannot tell when it has been triggered!!!!

            // Rejecting:
            // - press of HTML button as this can cause content change and remove ability redo when it shouldn't.
            // - mouse click in html editor - this doesn't cause text to change so no need to proceed,
            // - mouse click on grey area around buttons - this doesn't cause text to change so no need to proceed,
            if (mouseEventState.clickedEditorButtonClassname.includes('atto_html_button')
                || mouseEventState.isMouseClickInTextEditor
                || mouseEventState.isMouseClickDeadSpace) {
                return;
            }
        }

        this._addToUndo(this._getHTML(), true);
        this._updateButtonsStates();

    }
});


}, '@VERSION@', {"requires": ["moodle-editor_atto-plugin"]});
