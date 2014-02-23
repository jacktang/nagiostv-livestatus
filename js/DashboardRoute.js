

App.DashboardRoute = Ember.Route.extend({
	model: function(params) {
		console.info('App.DashboardRoute model()');
		var data = this.store.find('service');
		return data;
	},
	
	setupController: function(controller, model) {
		console.info('App.DashboardRoute setupController()');
		this._super(controller, model);
	}
});

App.DashboardIndexRoute = Ember.Route.extend({
	model: function(params) {
		console.info('App.DashboardIndexRoute model()');
		return this.modelFor('dashboard');
	},
	
	setupController: function(controller, model) {
		console.info('App.DashboardIndexRoute setupController()');
		this._super(controller, model);
	}
});

App.DashboardController = Ember.ObjectController.extend({
	
	actions:{
		refresh: function(){
			this.doRefresh();
		}
	},

	doRefresh: function() {

		var that = this;

		this.store.findAll('service').then(function(results){
			
			// clear this store we will use to compare against
			that.store.unloadAll('serviceno');
			// get a fresh list of services
			that.store.findAll('serviceno').then(function(results2){
				// loop through the items we have and compare against the fresh list
				that.store.all('service').forEach(function(record){		
					results.forEach(function(r){
						if (!that.store.recordIsLoaded(App.Serviceno, r.id)) {
							r.unloadRecord();
						}
					});
				});
			});
		
		}); // end findAll

	}, // doRefresh

	init: function() {
	
        console.info('@@@ DashboardController init()');
		this._super();

		var that = this;

		setInterval(function(){
			that.doRefresh();
		}, 5000)
	},

	deleteOldRows: function() {
		console.info('deleteOldRows');
	},

	isUpdating: function() {
		return this.get('store').isUpdating;
	}.property('store.isUpdating')

});

App.Service = DS.Model.extend({
	
	name: DS.attr(),
	
	next_check: DS.attr(),
	last_check: DS.attr(),
	last_state_change: DS.attr(),
	acknowledged: DS.attr(),
	animate: DS.attr(),
	host_name: DS.attr(),
	host_address: DS.attr(),
	display_name: DS.attr(),
	description: DS.attr(),
	
	comments_with_info_1: DS.attr(),
	comments_with_info_2: DS.attr(),
	state_type: DS.attr(),
	plugin_output: DS.attr(),
	state: DS.attr(),
	status: DS.attr(),
	status_text: DS.attr(),
	status_border: DS.attr(),
	state_duration: DS.attr(),



	hostNameAndHostAddressDifferent: function() {

		if (this.get('host_name') !== this.get('host_address')) {
			return true;
		} else {
			return false;
		}
	}.property('host_name','host_address'),

	my_custom_id: function() {
		//console.info('my_custom_id');
		//console.info(this);
		//console.info(this.get('host_name'));
		var temp = this.get('host_name')+'_'+this.get('display_name');
		temp = temp.replace(/ /g,"_");
		temp = temp.replace(/\./g,"_");
		temp = temp.replace(/:/g,"_");
		//var temp2 = temp.replace(/ /g,"_");
		return temp;
	}.property('host_name', 'display_name', 'App.last_command_check'),
	
	last_check_clean: function() {
		var date = new Date(this.get('last_check') * 1000);
		return date;
	}.property('last_check'),
	
	next_check_clean: function() {
		var date = new Date(this.get('next_check') * 1000);
		return date;
	}.property('next_check'),
	
	last_state_change_clean: function() {
		var date = new Date(this.get('last_state_change') * 1000);
		return date;
	}.property('last_state_change'),
	
	diff_clean: function() {

		var lsc = this.get('last_state_change');
		var lcc = App.get('last_command_check');
		var seconds_ago = lcc-lsc;
		
		var days = parseInt( seconds_ago / 86400 ) % 365;
        var hours = parseInt( seconds_ago / 3600 ) % 24;
        var minutes = parseInt( seconds_ago / 60 ) % 60;
        var seconds = seconds_ago % 60;
        var result = days + "d " + 
        	(hours < 10 ? "0" + hours : hours) + "h " + 
            (minutes < 10 ? "0" + minutes : minutes) + "m " + 
            (seconds  < 10 ? "0" + seconds : seconds) + "s";

		return result;
		
	}.property('last_state_change', 'App.last_command_check'),





	stateClassBorder: function() {
		var cc = "";
		switch(this.get('state')) {
			case 1:
				cc = "service-warning-border";
				break;
			case 2:
				cc = "service-critical-border";
				break;
			case 3:
				cc = "service-unknown-border";
				break;
			default:
				cc = "";
		}
		return cc;
	}.property('state'),

	stateClassText: function() {
		var cc = "";
		switch(this.get('state')) {
			case 1:
				cc = "service-warning-text";
				break;
			case 2:
				cc = "service-critical-text";
				break;
			case 3:
				cc = "service-unknown-text";
				break;
			default:
				cc = "";
		}
		return cc;
	}.property('state'),

	state_type_text: function() {
		var cc = "";
		switch(this.get('state_type')) {
			case 0:
				cc = "SOFT";
				break;
			case 1:
				cc = "HARD";
				break;
			default:
				cc = "UNKNOWN";
		}
		return cc;
	}.property('state_type'),
	
	// this is in use
	isSoft: function() {
		var soft = false;
		if (this.get('state_type') === 0) soft = true;
		return soft;
	}.property('state_type'),

	isCritical: function() {
		return (this.get('state') === 2);
	}.property('state')


	
});

// make a clone of service model that I'm using to compare against (for ember-data delete issue)
App.Serviceno = App.Service.extend({});

