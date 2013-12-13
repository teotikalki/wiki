CKEDITOR.plugins.add('toc', {
	requires: 'widget',
	icons: 'toc',
	init: function(editor) {
		editor.widgets.add('toc', {
			button: 'Table of content',
			template:
					'<div class="toc">' +
					    '<h2 class="simplebox-title">Title</h2>' +
					    '<div class="simplebox-content"><p>Content...</p></div>' +
					    '<img src="http://localhost:8080/portal/rest/jcr/repository/collaboration/lil-monk.jpg?time=1386665925177"/>' +
					'</div>',
			editables: {
					    title: {
						selector: '.simplebox-title',
						allowedContent: 'br strong em'
					    },
					    content: {
						selector: '.simplebox-content',
						allowedContent: 'p br ul ol li strong em'
					    }
			},
			upcast: function( element ) {
				return element.name == 'div' && element.hasClass( 'simplebox' );
			},
			data: function() {
				alert(editor.document.getDocumentElement().getElementsByTag("h1").count());
				var titleTags = { h1:1, h2:1, h3:1, h4:1, h5:1, h6:1 };
				var range = new CKEDITOR.dom.range( editor.document );
				var walker = new CKEDITOR.dom.walker( range );
				var titles = [];
				range.selectNodeContents( editor.document.getBody() );
				
				walker.evaluator = function( node )
				{
					if ( node.getName
						&& node.getName() in titleTags
						&& CKEDITOR.tools.trim( node.getText() ) ) {
							titles.push( node );
							alert(node.getName());
						}
				};
				
				while ( ( next = walker.next() ) )
					{}
				return titles.length ? titles : null;
				
				alert(titles.length);

			}
		})		
//		editor.ui.addButton('simplebox', {
//			label: "Insert simplebox",
//			command: 'insertsimplebox',
//			toolbar: 'insert'
//		});
	}
});

/**


Index: _source/core/config.js
===================================================================
--- _source/core/config.js	(revision 3466)
+++ _source/core/config.js	(working copy)
@@ -150,7 +150,7 @@
 
-	plugins : 'about,basicstyles,blockquote,button,clipboard,colorbutton,contextmenu,elementspath,enterkey,entities,find,flash,font,format,forms,horizontalrule,htmldataprocessor,image,indent,justify,keystrokes,link,list,maximize,newpage,pagebreak,pastefromword,pastetext,preview,print,removeformat,save,smiley,showblocks,sourcearea,stylescombo,table,tabletools,specialchar,tab,templates,toolbar,undo,wysiwygarea,wsc',
+	plugins : 'about,basicstyles,blockquote,button,clipboard,colorbutton,contextmenu,elementspath,enterkey,entities,find,flash,font,format,forms,horizontalrule,htmldataprocessor,image,indent,justify,keystrokes,link,list,maximize,newpage,pagebreak,pastefromword,pastetext,preview,print,removeformat,save,smiley,showblocks,sourcearea,stylescombo,table,tabletools,toc,specialchar,tab,templates,toolbar,undo,wysiwygarea,wsc',
 
 	 * List of additional plugins to be loaded. This is a tool setting which
Index: _source/lang/en.js
===================================================================
--- _source/lang/en.js	(revision 3466)
+++ _source/lang/en.js	(working copy)
@@ -620,5 +620,11 @@
 		copy : 'Copyright &copy; $1. All rights reserved.'
 	},
 
-	maximize : 'Maximize'
+	maximize : 'Maximize',
+	
+	contentsTable :
+	{
+		toolbar : 'Insert Table of Contents',
+		promptNoTitles : 'A table of documents cannot be generated for documents without heading paragraph styles.'
+	}
 };
Index: _source/plugins/toc/plugin.js
===================================================================
--- _source/plugins/toc/plugin.js	(revision 0)
+++ _source/plugins/toc/plugin.js	(revision 0)
@@ -0,0 +1,116 @@
+(function()
+{
+	// Title tags which been counted as content level marks .
+	var titleTags = { h1:1, h2:1, h3:1, h4:1, h5:1, h6:1 };
+	
+	// Retrieve all level marks within the whole document.
+	function findAllTitles( document )
+	{
+		var docRange = new CKEDITOR.dom.range(),
+			walker = new CKEDITOR.dom.walker( docRange ),
+			next,
+			titles = [];
+		docRange.selectNodeContents( document.getBody() );
+		walker.evaluator = function( node )
+		{
+			if ( node.getName
+				&& node.getName() in titleTags
+				&& CKEDITOR.tools.trim( node.getText() ) )
+				titles.push( node );
+		};
+		while ( ( next = walker.next() ) )
+		{}
+		return titles.length ? titles : null;
+	}
+	
+	function findLastBigger( list, level )
+	{
+		for ( var i = list.length-1 ; i >= 0 ; i-- )
+		{
+			// Previous bigger header has been found.
+			if ( list[ i ].level < level )
+				return list[ i ];
+			// We've reached top item, stop searching.
+			if ( list[ i ].indent == 0 )
+				break;
+		}
+	}
+	
+	CKEDITOR.plugins.add( 'toc',
+	{
+		requires : [ 'list' ],
+		
+		init : function( editor )
+		{
+			// Load skin definiton.
+			CKEDITOR.skins.load( editor, 'toc' );
+			
+			// Adding as an editor command.
+			editor.addCommand( 'toc',
+			{
+				exec : function( editor )
+				{
+					var list = [],
+						// Create an ordered list as FAKE root node.
+						root = new CKEDITOR.dom.element( 'ol', editor.document ),
+						nodes = findAllTitles( editor.document );
+					
+					if ( !nodes )
+					{
+						alert( editor.lang.contentsTable.promptNoTitles );
+						return;
+					}
+					
+					for ( var i = 0 ; i < nodes.length ; i++ )
+					{
+						var node = nodes[ i ],
+							level = parseInt( node.getName().substr( 1 ) ) - 1,
+							indent = level,
+							// Last bigger header (with lower level) in the list.
+							lastBigger = findLastBigger( list, level ),
+							length = list.length;
+						
+						// First list item always at level 0.
+						if ( !length || !lastBigger )
+							indent = 0;
+						else
+							indent = lastBigger.indent + 1;
+
+						var text = new CKEDITOR.dom.text( 
+							CKEDITOR.tools.trim( node.getText() ), editor.document
+						);
+						
+						list.push( 
+						{
+							contents : [
+								text
+							],
+							indent : indent,
+							parent : root,
+							// The real level of the item, despite of it's indent.
+							level : level
+						});
+					}
+
+					// Convert array to list using list plugin.
+					list = CKEDITOR.plugins.list.arrayToList( list );					
+					// DocumentFragment hold the generated list.
+					var listRoot = list.listNode.getFirst();
+					// XXX root.equals(listRoot) == false
+					// Insert the list into editor at the schema-corrected positon.
+					editor.insertElement( listRoot );
+				}
+			});
+			
+			// Registering the button UI.
+			if ( editor.lang.contentsTable )
+			{
+				editor.ui.addButton( 'ContentsTable',
+				{
+					label : editor.lang.contentsTable.toolbar,
+					command : 'toc'
+				});
+			}
+		}
+	});
+})();
Index: _source/plugins/toolbar/plugin.js
===================================================================
--- _source/plugins/toolbar/plugin.js	(revision 3466)
+++ _source/plugins/toolbar/plugin.js	(working copy)
@@ -283,7 +283,7 @@
 	'/',
 	['Styles','Format','Font','FontSize'],
 	['TextColor','BGColor'],
-	['Maximize', 'ShowBlocks','-','About']
+	['Maximize', 'ShowBlocks','-','About', 'ContentsTable']
 ];
 

Index: _source/skins/v2/skin.js
===================================================================
--- _source/skins/v2/skin.js	(revision 3466)
+++ _source/skins/v2/skin.js	(working copy)
@@ -19,6 +19,7 @@
 		editor		: { css : [ 'editor.css' ] },
 		dialog		: { css : [ 'dialog.css' ] },
 		templates	: { css : [ 'templates.css' ] },
+		toc	: { css : [ 'toc.css' ] },
 		margins		: [ 0, 14, 18, 14 ]
 	};
 })() );
Index: _source/skins/v2/toc.css
===================================================================
--- _source/skins/v2/toc.css	(revision 0)
+++ _source/skins/v2/toc.css	(revision 0)
@@ -0,0 +1,4 @@
+.cke_skin_default a.cke_button_toc .cke_icon
+{
+	background-image: url(images/toc_icon.gif);
+}
*/