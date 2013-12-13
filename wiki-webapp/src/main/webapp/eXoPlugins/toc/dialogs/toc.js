CKEDITOR.dialog.add( 'toc', function( editor ) {
    return {
        title: 'Table Of Content',
        minWidth: 200,
        minHeight: 100,
        contents: [
            {
                id: 'info',
                elements: [
                    // Dialog window UI elements.
                    {
                    	id: 'Depth',
                    	type: 'text',
                    	label: 'Depth',
                    	width: '50px',
                    	setup: function( widget ) {
                    		this.setValue( widget.data.depth );
                    	},
                    	commit: function( widget ) {
                    		widget.setData( 'depth', this.getValue() );
                    	}
                    },

                    {
                    	id: 'Numbered',
                    	type: 'select',
                    	label: 'Numbered',
                    	items: [
                	        [ 'Yes', 'Yes' ],
                	        [ 'No', 'No' ]
            	        ],
            	        setup: function( widget ) {
            	        	this.setValue( widget.data.numbered );
            	        },
            	        commit: function( widget ) {
            	        	widget.setData( 'numbered', this.getValue() );
            	        }
                    },
                    
                    {
                    	id: 'Scope',
                    	type: 'select',
                    	label: 'Scope',
                    	items: [
                    	        [ 'PAGE', 'PAGE' ],
                    	        [ 'LOCAL', 'LOCAL' ]
                	        ],
                    	setup: function( widget ) {
                    		this.setValue( widget.data.scope );
                    	},
                    	commit: function( widget ) {
                    		widget.setData( 'scope', this.getValue() );
                    	}
                    },
                    
                    {
                    	id: 'Start',
                    	type: 'text',
                    	label: 'Start',
                    	width: '50px',
                    	setup: function( widget ) {
                    		this.setValue( widget.data.start );
                    	},
                    	commit: function( widget ) {
                    		widget.setData( 'start', this.getValue() );
                    	}
                    }

                ]
            }
        ]    
    };
} );