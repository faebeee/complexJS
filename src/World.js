/**
 * Holds all the current entities and systems
 */
cx.World = Class.extend({
	entities : [],
    systems : [],
    managers : [],
    tag : 'cx.World',

    /**
     * Add entity to world
     * @param {[type]} entity [description]
     */
    addEntity : function ( entity ) {
        entity.index = this.entities.length;
        entity.setWorld(this);
		this.entities.push(entity);
		this._entityAdded(entity);
	},

	/**
	 * Remove entity from world and trigger codes from systems
	 */
	removeEntity : function(entity){
		this._entityDeleted(entity);
		delete this.entities[entity.index];
	},

	/**
	* return an entity
	* @param  {[type]} index [description]
	* @return {[type]}       [description]
	*/
	getEntity : function ( index ) {
		return this.entities[index];
	},

	/**
	 * add system to world
	 * @param {[type]} system [description]
	 */
	addSystem : function ( system ){
        system.setWorld(this);
		this.systems.push(system);
	},

	/**
	 * add manager to world
	 * @param {[type]} manager [description]
	 * @TODO
	 */
	addManager : function ( manager ){
	    this.managers.push(manager);
	},

	/**
	 * get a system
	 * @param  {[type]} systemName [description]
	 * @return {[type]}            [description]
	 */
	getSystem : function( system ) {
		var systemName = "";
		if ( typeof system == "string"){
			systemName = system;
		} else {
			systemName = system.tag;
		}
		for(var i = 0, len = this.systems.length; i < len; i++){
			var system = this.systems[i];
			if(system.tag == systemName){
				return system;
			}
		}
		return null;
	},

	/**
	 * get a manager
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	getManager : function ( name ) {
	    for(var i = 0, len = this.managers.length; i < len; i++){
			var manager = this.managers[i];
			if(manager.tag == name){
				return manager;
			}
		}
		return null;
	},

	_entityAdded : function( entity ){
		for(var s=0,len=this.systems.length; s<len;s++){
			var system = this.systems[s];
			if(system.type == system.TYPE_VOID){
				system.added(entity);
			}
		}
	},
	_entityDeleted : function(){
		for(var s=0,len=this.systems.length; s<len;s++){
			var system = this.systems[s];
			if(system.type == system.TYPE_VOID){
				system.removed(entity);
			}
		}
	},

	/**
	 * update step
	 * @return {[type]} [description]
	 */
	update : function ( ) {

		for(var s = 0, sLen = this.systems.length; s < sLen; s++) {
			var system = this.systems[s];

			if(system.type == system.TYPE_VOID){
				system.update();
			} else if(system.type == system.TYPE_PROCESS){
				for(var e = 0, eLen = this.entities.length; e < eLen; e++){
					var entity = this.entities[e];
					var entityComponents = [];
					var updateEntity = true

					for(var sC = 0, sCLen = system.components.length; sC < sCLen; sC++) {
						var systemComponent = system.components[sC];
						var hasEntityComponent = false;

						var entityComponent = entity.getComponent(systemComponent);
						if ( entityComponent != null ){
							entityComponents[systemComponent] = entityComponent;
							hasEntityComponent = false;
							continue;
						}

						if( !hasEntityComponent) {
							updateEntity = false;
						}
					}

					if(updateEntity){
						system.update(entity, entityComponents);
					}
				}
			}
		}
	}
});
