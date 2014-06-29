/**
 * [Entity description]
 */
cx.Entity = Class.extend({
	components : [],
	world : null,
    /**
     * constructor
     */
	init : function(){
		this.components = [];
	},

	getWorld : function(){
		return this.world;
	},
	
	setWorld : function( world){
		this.world = world;
	},
    /**
     * add a component to the entity
     * @param component
     */
	addComponent : function ( component ) {
		this.components.push( component );
	},

    /**
     * get a component by its name
     * @param componentName
     * @returns {*}
     */
	getComponent : function ( componentName ) {
		for(var i = 0, len = this.components.length; i < len; i++){
			var component = this.components[i];
			if(component.tag == componentName){
				return component;
			}
		}
		return null;
	}
});