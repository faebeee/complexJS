var ScriptSystem = cx.EntitySystem.extend({
	tag : 'cx.scriptsystem',

	init : function(){
		this.components = ["cx.scriptcomponent"];
	},


	update : function( entity, components){
		var scriptcomponent = components["cx.scriptcomponent"];
		var script = scriptcomponent.script;

		if ( scriptcomponent.setup == false ){
			script.setup(entity);
			scriptcomponent.setup = true;
		}
		console.log("script")
		script.update();

	}
});