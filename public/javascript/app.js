var organized = 0;

// Sets zindex outside functions to be used later unrestricted
var zindex = 1;
// Fix security concerns with rails
Backbone.sync = (function(original) {
	return function(method, model, options) {
		options.beforeSend = function(xhr) {
			xhr.setRequestHeader('X-CSRF-Token', $("meta[name='csrf-token']").attr('content'));
		};
		original(method, model, options);
	};
})(Backbone.sync);

// ** Model **

var Selfie = Backbone.Model.extend({

	defaults: {
		show_url: "https://pbs.twimg.com/profile_images/378800000553651991/ac5d33362645c4f415a7933d3c296d70.jpeg",
		caption: "",
		image_url: "",
		json_analysis: "",
		votes: 0,
		latitude: 0,
		longitude: 0,
		user_id: 0,
		photobooth_image_data: "",
		rot: -1,
		left: -1,
		top: -1
	}
});

// ** Collection **
var SelfieCollection = Backbone.Collection.extend({
	url: '/selfies',
	initialize: function(){
		this.fetch()
	},
	model: Selfie
});

// ** Submit Button for adding selfie to collection **
var SelfieFormView = Backbone.View.extend({
	events:{
		'submit' : 'submitCallback'
	},
	getSelfieData: function(){
		var imgElem = $('#gallery img')[0].src;
		var selfieData = new Selfie({ photobooth_image_data: imgElem, show_url: imgElem});
		return selfieData
	},
	submitCallback: function(e){
		e.preventDefault();
		var selfieData = this.getSelfieData();
		this.collection.create(selfieData);
	}
});

// ** Selfie View and setting actions on view (movable, alignable, clickable) **
var SelfieView = Backbone.View.extend({
	initialize: function(){
		this.listenTo(this.model, 'remove', this.remove);
		this.listenTo(this.model, 'change', this.render);
	},
	events: {
		"click [data-action='destroy']" : 'destroy',
		'click [id="show"]' : 'show',
		'click [id="stats-slide"]' : 'showSlide'
	},
	tagName: 'div',
	template_selfie: _.template( $("#selfieview-template").html() ),

	render: function(){
		var index_highest = 0;
		var new_selfie_zindex = $('.selfie-image').each(function() {
			    var index_current = parseInt($(this).css("z-index"), 10);
			    if (index_current > index_highest) {
			        index_highest = index_current;
					    }
					return(index_highest + 1);
		});
		/* Since these all get set at once, just checking the 'rot' for a -1 value should be sufficient */
		if (-1 == this.model.get("rot")){
			this.model.set({
				'rot' 	: Math.random()*30-15+'deg',
				'left' 	: Math.random()*50+'px',
				'top'	: Math.random()*300+'px',
				'z-index' : new_selfie_zindex
			});
		}

		this.$el.html(this.template_selfie( this.model.attributes ) );

		if (organized === 0){
			this.$el
				.css('-webkit-transform' , 'rotate('+this.model.get('rot')+')')
				.css('-moz-transform' , 'rotate('+this.model.get('rot')+')')
				.css('top' , this.model.get('top'))
				.css('left' , this.model.get('left'))
				.draggable({
					start: function(event, ui) {
						zindex++;
						var cssObj = { 'z-index' : zindex };
						$(this).css(cssObj);
					}
				})
				.mouseup(function(){
					zindex++;
					$(this).css('z-index' , zindex);
				})
				.dblclick(function(){
		  			$(this).css('-webkit-transform' , 'rotate(0)');
		  			$(this).css('-moz-transform' , 'rotate(0)');
				});
		}
		return this
	},

	show: function(e) {
		e.preventDefault();

			$('#slide-div-d3').empty();
		var projectionSlide = d3.select('#slide-div-d3').selectAll('div').data([
			{"value":this.model.get("caption"),"name":"caption"}
			]);
		projectionSlide.enter()
		.append('div')
		.style("background-color", "red")
		.style("height", "2em")
		.style("color", "aqua")
		.style("font-size", "1em")
		.style("font-family", 'Permanent Marker')
		.transition()
		.duration(3000)
		.text(function(d){
			return d.name
		})
		.style('width' , function(d){return d.value*150 + 2 + 'px';} )
		.transition()
		.duration(3000);
	},


	destroy: function(e){
		e.preventDefault();
		this.model.destroy();
	}
});


// ** List View **
var SelfieListView = Backbone.View.extend({
	initialize: function(){
		this.listenTo(this.collection, 'add', this.renderSelfie)
	},
	renderSelfie: function(instance_of_selfie){
		instance_of_selfie.view = new SelfieView({model: instance_of_selfie})
		this.$el.append( instance_of_selfie.view.render().el)
		return this;
	}
})

// ** Document Ready **
$(function(){
	var selfies_collection = new SelfieCollection();
	var selfie_list_view = new SelfieListView({collection: selfies_collection, el: $('#selfies-list')});
	var selfie_form_view = new SelfieFormView({collection: selfies_collection, el: $('#selfie-form')})
});







