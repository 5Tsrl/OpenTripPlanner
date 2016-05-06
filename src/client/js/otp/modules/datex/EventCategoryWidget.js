/* This program is free software: you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public License
as published by the Free Software Foundation, either version 3 of
the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


otp.namespace("otp.widgets");

otp.widgets.EventsCategoryWidget =
	otp.Class(otp.widgets.Widget, {

	_div: null,
	module : null,

	initialize : function(id, module) {
	    otp.configure(this, id);
		this.module = module;
	    otp.widgets.Widget.prototype.initialize.call(this, id, module, {
	        cssClass : 'otp-eventsWidget',
	        showHeader : false,
	        draggable : false,
			closeable : false,
	        transparent : true,
	        openInitially : true,
			sonOf:	'#tab2 .top'
	    });

		categoryView = new otp.modules.datex.CategoryView();
		categoryView.render().$el.appendTo(this.$());

		filterEventsView = new otp.modules.datex.FilterEventsView();
		filterEventsView.render().$el.appendTo(this.$());

	},
	show : function() {
        this.isOpen = true;
        if(this.isMinimized) this.minimizedTab.show();
        else this.mainDiv.fadeIn(); //show();
		
		$(".tab-content").hide(); // Hide all content
		$('ul.tabs li.traffic').addClass("active");
		$('.tab-container .traffic').fadeIn();
		$('.main-menu-5t li#menu-traffic').addClass("active");
		setTimeout(function(){
			setHeight();
		}, 1000);
		$('.features').fadeIn();
		
    },
	
	hide : function() {
        if(this.isMinimized) this.minimizedTab.hide();
        else this.mainDiv.fadeOut(); //hide();
		$('ul.tabs li.traffic').removeClass("active");
		$('.tab-container .traffic').hide();
		$('.main-menu-5t li#menu-traffic').removeClass("active");
		$('.features').fadeOut();

    },

	
    showInfos: function(infos, module) {
		infoListView = new otp.modules.datex.InfoListView({collection: infos});
		//infoListView.render().$el.appendTo($('#tab2 .main .infosCtnr'));
		$('#tab2 .main .infosCtnr').html(infoListView.render().$el)
		
	},
	setContentAndShow: function(events,  module) {
		

		//console.log('numero eventi:', events.length)
		eventListView = new otp.modules.datex.EventListView({collection: events})
		//eventListView.rinfresca().$el.appendTo(this.$());
		eventListView.rinfresca().$el.appendTo($('#tab2 .main .eventsCtnr'));

	},

	CLASS_NAME : "otp.widgets.EventsCategoryWidget"

});
