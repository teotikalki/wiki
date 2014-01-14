CKEDITOR.plugins.add('children', {
	requires: 'widget',
	icons: 'children',
	init: function(editor) {
		if (!editor.widgets.children) editor.widgets.children = {};
		if (!editor.widgets.children.count) editor.widgets.children.count = 0;
		editor.widgets.children.count ++;
		
		CKEDITOR.dialog.add('children', this.path + 'dialogs/children.js');
		editor.widgets.add('children', {
			id : 'children' + editor.widgets.children.count,
			button: 'Children pages',
			template:
					'<div class="children" id="children' + editor.widgets.children.count + '">' +
					    '<b class="children-title">Children Pages</b>' +
					    '<div class="children-content"><p>children...</p></div>' +
					'</div>',
			upcast: function( element ) {
				return element.name == 'div' && element.hasClass( 'children' );
			},
			dialog: 'children',
			allowedContent:
				'div(!children,align-left,align-right,align-center){width};' +
				'div(!children-content); h2(!children-title);div(!children-end)',
			init: function() {
				var childrenDiv = this.element.find("div.children-content").getItem(0);
				if (childrenDiv) {
					this.data.childrenNum = childrenDiv.$.getAttribute('childrenNum');
					this.data.depth = childrenDiv.$.getAttribute('depth');
					this.data.descendant = childrenDiv.$.getAttribute('descendant');
					this.data.excerpt = childrenDiv.$.getAttribute('excerpt');
					this.data.parent = childrenDiv.$.getAttribute('parent');
				}
				//alert("cc");
			},			
			data: function() {
				//alert(editor.document.getDocumentElement().getElementsByTag("h1").count());
				var content = "ChildrenNum: " + this.data.childrenNum + "<br/>" + 
								"Depth: " + this.data.depth + "<br/>" +
								"Descendant: " + this.data.descendant + "<br/>" +
								"Excerpt: " + this.data.excerpt + "<br/>" +
								"Parent: " + this.data.parent + "<br/>";
				editor.widgets.children = this;
				if (editor.widgets.children && editor.widgets.children.data ) {
					var children = editor.widgets.children;
					var childrenContent = children.element.find(".children-content").getItem(0);
					if (childrenContent) {
						childrenContent.setHtml(content);
					}
					var childrenDiv = children.element.find("div.children-content").getItem(0);
					if (childrenDiv) {
						childrenDiv.$.setAttribute('childrenNum', children.data.childrenNum);
						childrenDiv.$.setAttribute('depth', children.data.depth);
						childrenDiv.$.setAttribute('descendant', children.data.descendant);
						childrenDiv.$.setAttribute('excerpt', children.data.excerpt);
						childrenDiv.$.setAttribute('parent', children.data.parent);
					}
				}
			}
		});
		//if (!editor.widgets.toc) editor.widgets.toc = {};
		var count = 0;		
	}
});
