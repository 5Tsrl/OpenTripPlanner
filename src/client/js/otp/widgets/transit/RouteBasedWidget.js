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

otp.namespace("otp.widgets.transit");

otp.widgets.transit.RouteBasedWidget =
    otp.Class(/*otp.widgets.Widget, */{

    module : null,
    mainDiv         : null,
    sonOf           : 'body', //5t 

    routeId : null,

    activeLeg : null,
    timeIndex : null,

    routeLookup : [], // for retrieving route obj from numerical index in <select> element

    lastSize : null,

    initialize : function(id, module, options) {

        //otp.widgets.Widget.prototype.initialize.call(this, id, module, options);

        this.module = module;

        var this_ = this;
        this.mainDiv = $('<div />').attr('id', id).addClass('_otp-widget  white-popup mfp-hide').appendTo('body'/*this.sonOf*/);

        var routeSelectDiv = $('<header class="otp-tripViewer-select notDraggable" />').appendTo(this.mainDiv);
        //TRANSLATORS: Public transit Route: routename (Used in Trip viewer)
        $('<label for="routeSelect" >' + _tr('Route:') + '</label>').appendTo(routeSelectDiv);
        this.routeSelect = $('<select id="routeSelect"></select>')
        .appendTo(routeSelectDiv)
        .change(function() {
            this_.newRouteSelected();
        });

        _.each(module.webapp.indexApi.routes, function(route, key) {
            var optionHtml = '<option>';
            if(route.routeData.shortName) optionHtml += route.routeData.shortName+' ';
            if(route.routeData.longName) optionHtml += route.routeData.longName;
            optionHtml += '</option>';
            this_.routeSelect.append($(optionHtml));
            this_.routeLookup.push(route);
        });


        //var variantSelectDiv = $('<header class="otp-tripViewer-select notDraggable" />').appendTo(this.mainDiv);
        var variantSelectDiv = $('<div class="otp-tripViewer-select notDraggable" />').appendTo(routeSelectDiv);
        //TRANSLATORS: Public Transit Route variant: Start - end stop (Used in
        //trip viewer)
        $('<label for="variantSelect">' + _tr('Variant:') + '</label>').appendTo(variantSelectDiv);
        this.variantSelect = $('<select id="-variantSelect"></select>')
        .appendTo(variantSelectDiv)
        .change(function() {
            this_.newVariantSelected();
        });

    },

    newRouteSelected : function() {
        this.activeLeg = null;
        var route = this.routeLookup[this.routeSelect.prop("selectedIndex")]
        this.routeId = route.routeData.id;
        this.variantSelect.empty();
        this.clear();
        this.checkAndLoadVariants();
    },

    newVariantSelected : function() {
        this.activeLeg = null;
        var variantId = this.variantSelect.val();
        this.clear()
        this.setActiveVariant(this.module.webapp.indexApi.routes[this.routeId].variants[variantId]);
    },

    update : function(leg) {
        this.activeLeg = leg;
        this.activeTime = leg.startTime;

        this.routeId = leg.routeId;

        //console.log(this.module.webapp.indexApi.routes);
        var tiRouteInfo = this.module.webapp.indexApi.routes[leg.routeId];
        $('#routeSelect option:eq('+tiRouteInfo.index+')').prop('selected', true);

        this.checkAndLoadVariants();
    },

    checkAndLoadVariants : function() {
        var tiRouteInfo = this.module.webapp.indexApi.routes[this.routeId];
        if(tiRouteInfo.variants != null) {
            this.updateVariants();
        }
        else {
            this.module.webapp.indexApi.loadVariants(this.routeId, this, this.updateVariants);
        }
    },

    updateVariants : function() {
        var this_ = this;
        var route = this.module.webapp.indexApi.routes[this.routeId];

        if(!route.variants) {
            console.log("ERROR: indexApi.routes.["+this.routeId+"].variants null in RouteBasedWidget.updateVariants()");
            return;
        }

        this.variantSelect.empty();
        _.each(route.variants, function(variant) {
            $('<option value='+ variant.id +'>'+variant.desc+'</option>').appendTo(this_.variantSelect);
        });

        if(this.activeLeg) {
            this.module.webapp.indexApi.readVariantForTrip(this.activeLeg.routeId, this.activeLeg.tripId, this, this.setActiveVariant);
        }


        if(!this.activeLeg) {
            this.newVariantSelected();
        }
    },

    setActiveVariant : function(variantData) {
        var this_ = this;
        var route = this.module.webapp.indexApi.routes[this.routeId];
        this.activeVariant = route.variants[variantData.id];
        $('#'+this.id+'-variantSelect option:eq('+this.activeVariant.index+')').prop('selected', true);

        this.variantSelected(variantData);
    },

    // functions to be implemented by subclasses:

    clear : function() {
    },

    variantSelected : function() {
    },

});
