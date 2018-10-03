YUI.add("moodle-atto_advancedundo-button",function(e,t){e.namespace("M.atto_advancedundo").Button=e.Base.create("button",e.M.editor_atto.EditorPlugin,[],{_maxUndos:40,_undoStack:null,_redoStack:null,initializer:function(){this._undoStack=[],this._redoStack=[],this.addButton({title:"undo",icon:"e/undo",callback:this._undoHandler,buttonName:"undo",keys:90}),this.addButton({title:"redo",icon:"e/redo",callback:this._redoHandler,buttonName:"redo",keys:89}),this.get("host").on("pluginsloaded",function(){this._addToUndo(this._getHTML()),this.get("host").on("atto:selectionchanged",this._changeListener,this)},this),this._updateButtonsStates()},_addToRedo:function(e){this._redoStack.push(e)},_addToUndo:function(e,t){var n=this._undoStack[this._undoStack.length-1];typeof t=="undefined"&&(t=!1),n!==e&&(this._undoStack.push(e),t&&(this._redoStack=[]));while(this._undoStack.length>this._maxUndos)this._undoStack.shift()},_getHTML:function(){return this.get("host").getCleanHTML()},_getRedo:function(){return this._redoStack.pop()},_getUndo:function(e){if(this._undoStack.length===1)return this._undoStack[0];var t=this._undoStack.pop();return t===e&&(t=this._undoStack.pop()),this._undoStack.length===0&&this._addToUndo(t),t},_restoreValue:function(e){this.editor.setHTML(e),this._addToUndo(e)},_updateButtonsStates:function(){this._undoStack.length>1?this.enableButtons("undo"):this.disableButtons("undo"),this._redoStack.length>0?this.enableButtons("redo"):this.disableButtons("redo")},_undoHandler:function(e){e.preventDefault();var t=this._getHTML(),n=this._getUndo(t);if(t===n){this._updateButtonsStates();return}this._restoreValue(n),this._addToRedo(t),this._updateButtonsStates()},_redoHandler:function(e){e.preventDefault();var t=this._getHTML(),n=this._getRedo();if(t===n){this._updateButtonsStates();return}typeof n=="string"&&this._restoreValue(n),this._updateButtonsStates()},_filterMouseEvent:function(e){var t=e.event._event,n={isMouseClick:!1,isMouseClickInTextEditor:!1,isMouseClickOnEditorButton:!1,clickedEditorButtonClassname:""};n.isMouseClick=t.type=="pointerup"&&t.pointerType=="mouse"?!0:!1,n.isMouseClickDeadSpace=!1,n.isMouseClickInTextEditor=!1,n.isMouseClickOnEditorButton=!1,n.clickedEditorButtonClassname="";if(n.isMouseClick){var r=this._getElementPath(t.srcElement),i=r.length;for($i=0;$i<i;$i++){var s=r[$i].className;if(s.includes("editor_atto_content")){n.isMouseClickInTextEditor=!0;break}if(r[$i].nodeName=="BUTTON"){n.isMouseClickOnEditorButton=!0,n.clickedEditorButtonClassname=s;break}if(s.includes("editor_atto_wrap")){n.isMouseClickDeadSpace=!0;break}}}return n},_getElementPath:function(e){var t=[];while(e){t.push(e);if(e.tagName==="HTML")return t;e=e.parentElement}},_redoButtonIsActive:function(e){return this._redoStack.length>0},_changeListener:function(e){if(e.event==null)return;var t=this._filterMouseEvent(e),n=e.event.type,r=e.event.keyCode;if(!this._redoButtonIsActive()){var i=[8,13,37,38,39,40,46,190],s=n=="keyup"&&i.indexOf(r)>-1?!0:!1;if(!s&&!t.isMouseClickInTextEditor)return}else if(t.clickedEditorButtonClassname.includes("atto_html_button")||t.isMouseClickInTextEditor||t.isMouseClickDeadSpace)return;this._addToUndo(this._getHTML(),!0),this._updateButtonsStates()}})},"@VERSION@",{requires:["moodle-editor_atto-plugin"]});
