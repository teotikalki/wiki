CKEDITOR.dialog.add( 'children', function( editor ) {
    return {
        title: 'Children pages',
        minWidth: 200,
        minHeight: 100,
        contents: [
            {
                id: 'infos',
                elements: [
                    // Dialog window UI elements.
                    {
                    	id: 'ChildrenNum',
                    	type: 'text',
                    	label: 'ChildrenNum',
                    	width: '50px',
                    	setup: function( widget ) {
                    		this.setValue( widget.data.childrenNum );
                    	},
                    	commit: function( widget ) {
                    		widget.setData( 'childrenNum', this.getValue() );
                    	}
                    },
                    
                    {
                    	id: 'Depth',
                    	type: 'text',
                    	label: 'Depth',
                    	width: '50px',
                    	setup: function(widget) {
                    		this.setValue(widget.data.depth);
                    	},
                    	commit: function(widget) {
                    		widget.setData('depth', this.getValue());
                    	}
                    },
                    
                    {
                    	id: 'Descendant',
                    	type: 'select',
                    	label: 'Descendant',
                    	items: [
                	        [ 'Yes', 'Yes' ],
                	        [ 'No', 'No' ]
            	        ],
            	        setup: function( widget ) {
            	        	this.setValue( widget.data.descendant );
            	        },
            	        commit: function( widget ) {
            	        	widget.setData( 'descendant', this.getValue() );
            	        }
                    },
                    
                    {
                    	id: 'Excerpt',
                    	type: 'select',
                    	label: 'Excerpt',
                    	items: [
                    	        [ 'Yes', 'Yes' ],
                    	        [ 'No', 'No' ]
                	        ],
                    	setup: function( widget ) {
                    		this.setValue( widget.data.excerpt );
                    	},
                    	commit: function( widget ) {
                    		widget.setData( 'excerpt', this.getValue() );
                    	}
                    },
                    
                    {
                    	id: 'Parent',
                    	type: 'text',
                    	label: 'Parent',
                    	width: '50px',
                    	setup: function( widget ) {
                    		this.setValue( widget.data.parent );
                    	},
                    	commit: function( widget ) {
                    		widget.setData( 'parent', this.getValue() );
                    	}
                    }
                ]
            }
        ]    
    };
} );