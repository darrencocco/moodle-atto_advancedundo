var stackStorageObject = {};
stackStorageObject.undoStack = [];
stackStorageObject.redoStack = [];
stackStorageObject.lastKnownState = null;
stackStorageObject.locked = false;
stackStorageObject.maxUndos = 40;
stackStorageObject.appendUndo = function(message) {
    if (this.locked) {
        return {
            action: 'AppendRejected',
            undoStackSize: this.undoStack.length,
            redoStackSize: this.redoStack.length
        };
    }
    var html = this.cleanHtml(message.editorContent);
    if (this.lastKnownState === null) {
        if (html !== this.undoStack[this.undoStack.length - 1]) {
            this.undoStack.push(html);
        }
    } else {
        if (this.lastKnownState !== html) {
            // New state, clear redo stack
            this.undoStack.push(html);
            this.lastKnownState = null;
            this.redoStack = [];
        }
    }

    while (this.undoStack.length > this.maxUndos) {
        this.undoStack.shift();
    }
    return {
        action: 'UndoRetained',
        undoStackSize: this.undoStack.length,
        redoStackSize: this.redoStack.length
    };
};
stackStorageObject.getRedo = function(message) {
    this.locked = true;
    if (this.redoStack.length < 1) {
        return {
            action: 'RedoNoDelta',
            undoStackSize: this.undoStack.length,
            redoStackSize: this.redoStack.length
        };
    }
    var html = this.cleanHtml(message.editorContent);
    var redo = this.redoStack.pop();
    if (html === redo) {
        return {
            action: 'RedoNoDelta',
            undoStackSize: this.undoStack.length,
            redoStackSize: this.redoStack.length
        };
    } else {
        this.undoStack.push(html);
        this.lastKnownState = redo;
        return {
            action: 'RedoSupplied',
            contentToRestore: redo,
            undoStackSize: this.undoStack.length,
            redoStackSize: this.redoStack.length
        };
    }
};
stackStorageObject.getUndo = function(message) {
    this.locked = true;
    var html = this.cleanHtml(message.editorContent);
    var undo = this._getUndo(html);
    if (html === undo) {
        return {
            action: 'UndoNoDelta',
            undoStackSize: this.undoStack.length,
            redoStackSize: this.redoStack.length
        };
    } else {
        this.redoStack.push(html);
        this.lastKnownState = undo;
        return {
            action: 'UndoSupplied',
            contentToRestore: undo,
            undoStackSize: this.undoStack.length,
            redoStackSize: this.redoStack.length
        };
    }
};
stackStorageObject._getUndo = function(current) {
    if (this.undoStack.length === 1) {
        return this.undoStack[0];
    }

    if (this.lastKnownState !== null) {
        if (current !== this.lastKnownState) {
            return current;
        } else {
            return this.undoStack.pop();
        }
    } else {
        var last = this.undoStack.pop();
        if (last !== current) {
            return last;
        } else {
            return this.undoStack.pop();
        }
    }
};
stackStorageObject.cleanHtml = function(content) {
    if (content === '<p></p>' || content === '<p><br></p>') {
        return '';
    }

    // Removing limited things that can break the page or a disallowed, like unclosed comments, style blocks, etc.
    var rules = [
        {regex: /(<[^>]*) +id="yui[^"]*"([^>]*>)/gi, replace: "$1$2"},
        // Remove any style blocks. Some browsers do not work well with them in a contenteditable.
        // Plus style blocks are not allowed in body html, except with "scoped", which most browsers don't support as of 2015.
        // Reference: "http://stackoverflow.com/questions/1068280/javascript-regex-multiline-flag-doesnt-work"
        {regex: /<style[^>]*>[\s\S]*?<\/style>/gi, replace: ""},

        // Remove any open HTML comment opens that are not followed by a close. This can completely break page layout.
        {regex: /<!--(?![\s\S]*?-->)/gi, replace: ""},

        // Source: "http://www.codinghorror.com/blog/2006/01/cleaning-words-nasty-html.html"
        // Remove forbidden tags for content, title, meta, style, st0-9, head, font, html, body, link.
        {regex: /<\/?(?:title|meta|style|st\d|head|font|html|body|link)[^>]*?>/gi, replace: ""}
    ];

    content = this._filterContentWithRules(content, rules);
    return content;
};
stackStorageObject.unlock = function() {
    this.locked = false;
};
stackStorageObject._filterContentWithRules = function(content, rules) {
    var i = 0;
    for (i = 0; i < rules.length; i++) {
        content = content.replace(rules[i].regex, rules[i].replace);
    }

    return content;
};
onmessage = function(message) {
    switch(message.data.action) {
        case 'AppendUndo':
            postMessage(stackStorageObject.appendUndo(message.data));
            break;
        case 'GetRedo':
            postMessage(stackStorageObject.getRedo(message.data));
            break;
        case 'GetUndo':
            postMessage(stackStorageObject.getUndo(message.data));
            break;
        case 'Unlock':
            stackStorageObject.unlock();
    }
};