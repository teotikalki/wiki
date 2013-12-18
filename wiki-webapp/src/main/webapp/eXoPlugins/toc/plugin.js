CKEDITOR.plugins.add('toc', {
	requires: 'widget',
	icons: 'toc',
	init: function(editor) {
		if (!editor.widgets.toc) editor.widgets.toc = {};
		if (!editor.widgets.toc.count) editor.widgets.toc.count = 0;
		editor.widgets.toc.count ++;
		
		CKEDITOR.dialog.add('toc', this.path + 'dialogs/toc.js');
		editor.widgets.add('toc', {
			id : 'toc' + editor.widgets.toc.count,
			button: 'Table of content',
			template:
					'<div class="toc" id="toc' + editor.widgets.toc.count + '">' +
					    '<b class="toc-title">Table Of Content</b>' +
					    '<div class="toc-content"><p>Content...</p></div>' +
					'</div>',
			upcast: function( element ) {
				return element.name == 'div' && element.hasClass( 'toc' );
			},
			dialog: 'toc',
			allowedContent:
				'div(!toc,align-left,align-right,align-center){width};' +
				'div(!toc-content); h2(!toc-title);div(!toc-end)',
			init: function() {
				var tocDiv = this.element.find("div.toc-content").getItem(0);
				if (tocDiv) {
					this.data.depth = tocDiv.$.getAttribute('depth');
					this.data.numbered = tocDiv.$.getAttribute('numbered');
					this.data.scope = tocDiv.$.getAttribute('scope');
					this.data.start = tocDiv.$.getAttribute('start');
				}
				//alert("cc");
			},			
			data: function() {
				//alert(editor.document.getDocumentElement().getElementsByTag("h1").count());
				editor.widgets.toc = this;

			}
		});
		//if (!editor.widgets.toc) editor.widgets.toc = {};
		var count = 0;		
		
		editor.on('change', function(e) {
//			console.log(e);
//			console.log(editor.widgets);
			if (editor && editor.document) {
				var titleTags = { h1:0, h2:0, h3:0, h4:0, h5:0, h6:0, div:0 };
				var range = new CKEDITOR.dom.range( editor.document );
				var walker = new CKEDITOR.dom.walker( range );
				var headings = [];
				//----------------------------------------------------
				//get all headings
				range.selectNodeContents( editor.document.getBody() );

				walker.evaluator = function( node )
				{
					if ( node.getName
						&& node.getName() in titleTags
						&& CKEDITOR.tools.trim( node.getText() ) ) {
//							alert(node.getName());
//							console.log(node.$.id);
						if (node.getName() == 'div' && node.$.getAttribute('class') && node.$.getAttribute('class').contains('toc') &&
								headings.length > 0) {
							headings[headings.length -1].$.setAttribute("local", "active");
						} else {
							node.removeAttribute("local");
						} 
						if (node.getName() != 'div') {
							if (node.$.id == undefined || node.$.id == "") {
								count++;
								node.$.id='heading' + count;
							}
							headings.push( node );
	//							content += "<a href='#" + node.$.id + "'>" + node.$.innerHTML + "</a><br/>";
						}
					}
				};
				while ( ( next = walker.next() ) )
				{}
				//----------------------------------------------------
				/** build heading with content:
				 * <ol>
					 <li>test1
					   <ol>
					     <li>test3</li>
					     <li>test4</li>
					   </ol>
					 </li>
					 <li>test2></li>
					</ol>
				*/
				var depthLevel = editor.widgets.toc && editor.widgets.toc.data && editor.widgets.toc.data.depth ?
									editor.widgets.toc.data.depth : 1000;
				var startLevel = editor.widgets.toc && editor.widgets.toc.data && editor.widgets.toc.data.start ?
									editor.widgets.toc.data.start : 1;
				
				var stack = [];
				for (var i = 0; i < headings.length; i++) {
					var currentNode = headings[i];
					var currentArr = [];
					currentArr.push(currentNode);
					if (stack.length == 0) {
						stack.push(currentArr);
					} else if (stack[stack.length-1][0].getName() < currentNode.getName()){
//						if (depthLevel == stack.length) {
//							continue;
//						}
						stack.push(currentArr);						
					} else if (stack[stack.length-1][0].getName() == currentNode.getName()) {
						stack[stack.length-1].push(currentNode);
					} else {//stack[stack.length-1][0].getName() > currentNode.getName()
//						while (stack.length > startLevel && stack[stack.length-1][0].getName() > currentNode.getName()) {
						while (stack.length > 1 && stack[stack.length-1][0].getName() > currentNode.getName()) {							
							var prevArr = stack.pop();
							var prevPrevArr = stack[stack.length-1];
							var lastOfPrevPrev = prevPrevArr[prevPrevArr.length-1];
							if (!lastOfPrevPrev.child) lastOfPrevPrev.child = [];
							lastOfPrevPrev.child.addAll(prevArr);
						}
						if (stack[stack.length-1][0].getName() <= currentNode.getName()) {
							stack[stack.length-1].push(currentNode);
						}
					}
				}
				
//				while (stack.length > startLevel) {
				while (stack.length > 1) {				
					var prevArr = stack.pop();
					var prevPrevArr = stack[stack.length-1];
					var lastOfPrevPrev = prevPrevArr[prevPrevArr.length-1];
					if (!lastOfPrevPrev.child) lastOfPrevPrev.child = [];
					lastOfPrevPrev.child.addAll(prevArr);
				}
				
				//var content = getHeadingWithIndents(headings);
				var open = editor.widgets.toc && editor.widgets.toc.data && (editor.widgets.toc.data.numbered=="Yes")? "<ol>" : "<ul>"; 
				var close = editor.widgets.toc && editor.widgets.toc.data && (editor.widgets.toc.data.numbered=="Yes")? "</ol>" : "</ul>";
				var tocScope = editor.widgets.toc && editor.widgets.toc.data && (editor.widgets.toc.data.scope)? editor.widgets.toc.data.scope : "PAGE";
				var content = open;
				var print = function(elem, indent, isPrinted) {
					if (elem)
					for (var i = 0; i < elem.length; i++) {
						var newIsPrinted = isPrinted || 
										   (tocScope == "LOCAL") && (elem[i].$.getAttribute('local')=='active'); 
						if (newIsPrinted && (indent.length >= startLevel - 1) && (indent.length < depthLevel))
							content +="<li><a href='#" + elem[i].$.id + "'>" + elem[i].$.innerHTML + "</a>";
						//console.log(indent + elem[i].getName() + " " + newIsPrinted);
						if (elem[i].child) {
							if (newIsPrinted && (indent.length >= startLevel - 1) && (indent.length < depthLevel))
								content += open;
							print(elem[i].child, indent + " ", newIsPrinted);
							if (newIsPrinted && (indent.length >= startLevel - 1) && (indent.length < depthLevel))
								content += close;
						}
						if (newIsPrinted && (indent.length >= startLevel - 1) && (indent.length < depthLevel))
							content+="</li>";
					}
				};

//				for (var i = startLevel - 1; i < stack.length; i++) {
//					print(stack[startLevel - 1], "", tocScope == "PAGE");
//					console.log(i);
//				}
				print(stack[0], "", tocScope == "PAGE");
				content += close;
//				console.log("Content: " + content);

				//----------------------------------------------------
				//set content and properties
				//alert(titles.length);						
				if (editor.widgets.toc && editor.widgets.toc.data ) {
					var toc = editor.widgets.toc;
					var tocContent = toc.element.find(".toc-content").getItem(0);
					if (tocContent) {
						tocContent.setHtml(content);
					}
					var tocDiv = toc.element.find("div.toc-content").getItem(0);
					if (tocDiv) {
						tocDiv.$.setAttribute('depth', toc.data.depth);
						tocDiv.$.setAttribute('numbered', toc.data.numbered);
						tocDiv.$.setAttribute('scope', toc.data.scope);
						tocDiv.$.setAttribute('start', toc.data.start);
					}
				}
			}
			
		});
//		editor.ui.addButton('toc', {
//			label: "Insert toc",
//			command: 'inserttoc',
//			toolbar: 'insert'
//		});
	}
});
