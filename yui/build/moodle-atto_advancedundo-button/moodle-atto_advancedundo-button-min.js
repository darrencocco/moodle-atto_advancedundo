YUI.add("moodle-atto_advancedundo-button",function(e,t){e.namespace("M.atto_advancedundo").Button=e.Base.create("button",e.M.editor_atto.EditorPlugin,[],{_webWorker:null,_undoStackSize:0,_redoStackSize:0,initializer:function(){this._webWorker=new Worker("/local/webworkers/loader.php/-1/atto_advancedundo/stacks-manager"),this._webWorker.onmessage=this._workerMessageHandler.bind(this),this.addButton({title:"undo",icon:"e/undo",callback:this._undoHandler,buttonName:"undo",keys:90}),this.addButton({title:"redo",icon:"e/redo",callback:this._redoHandler,buttonName:"redo",keys:89}),this.get("host").on("pluginsloaded",function(){this._addToUndo(),this.get("host").on("atto:selectionchanged",this._changeListener,this)},this),this._updateButtonStates({undoStackSize:1,redoStackSize:0})},_addToUndo:function(e){typeof e=="undefined"&&(e=!1),this._webWorker.postMessage({action:"AppendUndo",clearRedo:e,editorContent:this._getEditorContent()})},_workerMessageHandler:function(e){switch(e.data.action){case"RedoSupplied":case"UndoSupplied":this._updateButtonStates(e.data),this._restoreValue(e.data),this._webWorker.postMessage({action:"Unlock"});break;case"UndoRetained":case"RedoNoDelta":case"UndoNoDelta":this._updateButtonStates(e.data),this._webWorker.postMessage({action:"Unlock"});break;default:}},_getEditorContent:function(){return this.get("host").editor.get("innerHTML")},_restoreValue:function(e){this.editor.setHTML(e.contentToRestore)},_updateButtonStates:function(e){this._undoStackSize=e.undoStackSize,this._redoStackSize=e.redoStackSize,this._undoStackSize>1?this.enableButtons("undo"):this.disableButtons("undo"),this._redoStackSize>0?this.enableButtons("redo"):this.disableButtons("redo")},_undoHandler:function(e){e.preventDefault(),this._webWorker.postMessage({action:"GetUndo",editorContent:this._getEditorContent()})},_redoHandler:function(e){e.preventDefault(),this._webWorker.postMessage({action:"GetRedo",editorContent:this._getEditorContent()})},_filterMouseEvent:function(e){var t=e.event._event,n={isMouseClick:!1,isMouseClickInTextEditor:!1,isMouseClickOnEditorButton:!1,clickedEditorButtonClassname:""};n.isMouseClick=!1;if(t.type=="pointerup"&&t.pointerType=="mouse"||t.type=="mouseup")n.isMouseClick=!0;n.isMouseClickDeadSpace=!1,n.isMouseClickInTextEditor=!1,n.isMouseClickOnEditorButton=!1,n.clickedEditorButtonClassname="";if(n.isMouseClick){var r=this._getElementPath(t.target),i=r.length;for(var s=0;s<i;s++){var o=r[s].className;if(o.includes("editor_atto_content")){n.isMouseClickInTextEditor=!0;break}if(r[s].nodeName=="BUTTON"){n.isMouseClickOnEditorButton=!0,n.clickedEditorButtonClassname=o;break}if(o.includes("editor_atto_wrap")){n.isMouseClickDeadSpace=!0;break}}}return n},_getElementPath:function(e){var t=[];while(e){t.push(e);if(e.tagName==="HTML")return t;e=e.parentElement}},_redoButtonIsActive:function(e){return this._redoStackSize>0},_changeListener:function(e){if(e.event==null)return;var t=this._filterMouseEvent(e),n=e.event.type,r=e.event.keyCode;if(!this._redoButtonIsActive()){var i=[8,13,37,38,39,40,46,190],s=n=="keyup"&&i.indexOf(r)>-1?!0:!1;if(!s&&!t.isMouseClickInTextEditor)return}else if(t.clickedEditorButtonClassname.includes("atto_html_button")||t.clickedEditorButtonClassname.includes("atto_advancedundo_button")||t.isMouseClickInTextEditor||t.isMouseClickDeadSpace)return;this._addToUndo(!0)}})},"@VERSION@",{requires:["moodle-editor_atto-plugin"]});
