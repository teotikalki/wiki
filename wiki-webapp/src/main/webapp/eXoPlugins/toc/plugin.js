CKEDITOR.plugins.add('toc', {
	requires: 'widget',
	icons: 'toc',
	init: function(editor) {
		CKEDITOR.dialog.add('toc', this.path + 'dialogs/toc.js');
		editor.widgets.add('toc', {
			button: 'Table of content',
			template:
					'<div class="toc">' +
					    '<b class="toc-title">Table Of Content</b>' +
					    '<div class="toc-content"><p>Content...</p></div>' +
					'</div>',
			upcast: function( element ) {
				return element.name == 'div' && element.hasClass( 'toc' );
			},
			dialog: 'toc',
			allowedContent:
				'div(!toc,align-left,align-right,align-center){width};' +
				'div(!toc-content); h2(!toc-title)',
			init: function() {
				var width = this.element.getStyle( 'width' );
				if ( width )
				    this.setData( 'width', width );
				if ( this.element.hasClass( 'align-left' ) )
				    this.setData( 'align', 'left' );
				if ( this.element.hasClass( 'align-right' ) )
				    this.setData( 'align', 'right' );
				if ( this.element.hasClass( 'align-center' ) )
				    this.setData( 'align', 'center' );
				this.hdata = 'aaaaa';
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
				var titleTags = { h1:0, h2:0, h3:0, h4:0, h5:0, h6:0 };
				var range = new CKEDITOR.dom.range( editor.document );
				var walker = new CKEDITOR.dom.walker( range );
				var titles = [];
				var content = "";
				range.selectNodeContents( editor.document.getBody() );


				walker.evaluator = function( node )
				{
					if ( node.getName
						&& node.getName() in titleTags
						&& CKEDITOR.tools.trim( node.getText() ) ) {
							titles.push( node );
//							alert(node.getName());
							console.log(node.$.id);
							if (node.$.id == undefined || node.$.id == "") {
								count++;
								node.$.id='heading' + count;
							}
							content += "<a href='#" + node.$.id + "'>" + node.$.innerHTML + "</a><br/>";
						}
				};
				
				while ( ( next = walker.next() ) )
					{}
				//alert(titles.length);						
				if (editor.widgets.toc && editor.widgets.toc.element.find(".toc-content p")
				.getItem(0))
				editor.widgets.toc.element.find(".toc-content p")
				.getItem(0).setHtml(content);
			}
			
		});
//		editor.ui.addButton('toc', {
//			label: "Insert toc",
//			command: 'inserttoc',
//			toolbar: 'insert'
//		});
	}
});
