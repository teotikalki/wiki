generateTree = function(src) {
	var ret = "<li>";
	ret += "<span class='wikilink'>";
	var path = decodeURIComponent(src.path);
	ret += "<a href='" + path.substring(path.lastIndexOf("/") + 1) + "'>"
	ret += src.name; 
	ret += "</a>";
	ret += "</span>";
	if (src.children && src.children.length > 0) {
		for (var i = 0; i < src.children.length; i++) {
			ret += "<ul>" + generateTree(src.children[i]) + "</ul>";
		}
	}
	return ret + "</li>";
}

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
					this.data.type = childrenDiv.$.getAttribute('type');
					this.data.owner = childrenDiv.$.getAttribute('owner');
				}
				//alert("cc");
			},			
			data: function() {
				//alert(editor.document.getDocumentElement().getElementsByTag("h1").count());
				editor.widgets.children = this;
				if (editor.widgets.children && editor.widgets.children.data ) {
					//prepare data
					var content = "ChildrenNum: " + this.data.childrenNum + "<br/>" + 
					"Depth: " + this.data.depth + "<br/>" +
					"Descendant: " + this.data.descendant + "<br/>" +
					"Excerpt: " + this.data.excerpt + "<br/>" +
					"Parent: " + this.data.parent + "<br/>" +
					eXo.wiki.UIWikiPortlet.pageType + ":" + eXo.wiki.UIWikiPortlet.pageOwner +
					":" + eXo.wiki.UIWikiPortlet.pageId;
					var restUrl = "/" + eXo.env.rest.context + "/wiki/tree/CHILDREN?path=" + 
					eXo.wiki.UIWikiPortlet.pageType + "/" + 
					eXo.wiki.UIWikiPortlet.pageOwner + "/" + 
					(this.data.parent ? this.data.parent:eXo.wiki.UIWikiPortlet.pageId) + 
					"&excerpt=" + (this.data.excerpt && this.data.excerpt.toLowerCase() == "yes" ? "true" : "false") +
					"&depth=" + (this.data.depth?this.data.depth : 1000) +
					"&showDes=" + ((this.data.descendant && this.data.descendant.toLowerCase() == "yes" || !this.data.descendant) ? "true" : "false");
					restUrl = restUrl.replace("//", "/");
					$.ajax({
						async : true,
						url : restUrl,
						type : 'GET',
						data : '',
						success : function(data) {
							var content = "<ul>";
							if (data.jsonList && data.jsonList.length > 0) {
								for (var i = 0; i < data.jsonList.length; i++) {
									if (editor.widgets.children.data.childrenNum && editor.widgets.children.data.childrenNum == i) break;
									content += generateTree(data.jsonList[i]);
								}
							}
							content += "</ul>";
							
							var children = editor.widgets.children;
							var childrenContent = children.element.find(".children-content").getItem(0);
							if (childrenContent) {
								childrenContent.setHtml(content);
							}
						}
					});
					//insert data
					var children = editor.widgets.children;
					var childrenContent = children.element.find(".children-content").getItem(0);
					if (childrenContent) {
						childrenContent.setHtml(content);
					}
					
					//save preferences
					var childrenDiv = children.element.find("div.children-content").getItem(0);
					if (childrenDiv) {
						childrenDiv.$.setAttribute('childrenNum', children.data.childrenNum);
						childrenDiv.$.setAttribute('depth', children.data.depth);
						childrenDiv.$.setAttribute('descendant', children.data.descendant);
						childrenDiv.$.setAttribute('excerpt', children.data.excerpt);
						childrenDiv.$.setAttribute('parent', children.data.parent);
						
						childrenDiv.$.setAttribute('type', eXo.wiki.UIWikiPortlet.pageType);
						childrenDiv.$.setAttribute('owner', eXo.wiki.UIWikiPortlet.pageOwner);
					}
				}
			}
		});
		//if (!editor.widgets.toc) editor.widgets.toc = {};
		var count = 0;		
	}
});
