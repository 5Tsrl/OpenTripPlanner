/* This program is free software: you can redistribute it and/or
   modify it under the teMap.jsrms of the GNU Lesser General Public License
   as published by the Free Software Foundation, either version 3 of
   the License, or (at your option) any later version.
   
   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
   
   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>. 
*/

otp.namespace("otp.core");

otp.core.Map = otp.Class({

    webapp          : null,

    lmap            : null,
    layerControl    : null,
    
    contextMenu             : null,
    contextMenuModuleItems  : null,
    contextMenuLatLng       : null,
    
    baseLayers  : {},
    
    initialize : function(webapp) {
        var this_ = this;
        this.webapp = webapp;
        
        
                
        //var baseLayers = {};
        var defaultBaseLayer = null;
        //L.mapbox.accessToken = 'pk.eyJ1IjoiNXR0b3Jpbm8iLCJhIjoiY2lnZGZqOHN2MXZ2aXVvbThqemtyeHJoeSJ9.VB1TQcIbXed4F9OD5uoDsw';
        for(var i=0; i<otp.config.baseLayers.length; i++) { //otp.config.baseLayers.length-1; i >= 0; i--) 
            var layerConfig = otp.config.baseLayers[i];

            var layerProps = { };
            if(layerConfig.attribution) layerProps['attribution'] = layerConfig.attribution;
            if(layerConfig.subdomains) layerProps['subdomains'] = layerConfig.subdomains;

            var layer = new L.TileLayer(layerConfig.tileUrl, layerProps);
            //raf in caso di custom layer, sovrascrivo layer con un L.mapbox.styleLayer
            if(layerConfig.styleUrl){
                L.mapbox.accessToken = layerConfig.accessToken
                layer = new L.mapbox.styleLayer(layerConfig.styleUrl/*, layerProps*/)
                
            }

	        this.baseLayers[layerConfig.name] = layer;
            if(i == 0) defaultBaseLayer = layer;            
	        
	        if(typeof layerConfig.getTileUrl != 'undefined') {
        	    layer.getTileUrl = otp.config.getTileUrl;
            }
        }
        

        var mapProps = { 
            //layers  : [ defaultBaseLayer ], solo così mostra l'attribution su styleUrl mapbox
            center : (otp.config.initLatLng || new L.LatLng(0,0)),
            zoom : (otp.config.initZoom || 2),
            zoomControl:false
        }
        if(otp.config.minZoom) mapProps['minZoom'] = otp.config.minZoom;  //_.extend(mapProps, { minZoom : otp.config.minZoom });
        if(otp.config.maxZoom) mapProps['maxZoom'] = otp.config.maxZoom; //_.extend(mapProps, { maxZoom : otp.config.maxZoom });

        //raf mapbox
        //this.lmap = new L.Map('map', mapProps);
        this.lmap = new L.mapbox.map('map', null, mapProps);
        this.baseLayers.Mappa.addTo(this.lmap);
        this.layer_control = L.control.layers(this.baseLayers).addTo(this.lmap);
        L.control.zoom({ position : 'topright' }).addTo(this.lmap);
        
        //mapzen geocoder control
        var options ={
     		  //focus: true,
     		  //layers: ["street", "locality"]     		  
     	  }
     	  L.control.geocoder(null, options).addTo(this.lmap);
        
        
        
        //Locate control
        
        L.control.locate({
            position: 'topright',
            strings: {
                title: "mostra la mia posizione",  // title of the locate control
                metersUnit: "metri", // string for metric units
                feetUnit: "feet", // string for imperial units
                popup: "Ti trovi in un raggio di {distance} {unit} da questo punto",  // text to appear if user clicks on circle
                outsideMapBoundsMsg: "You seem located outside the boundaries of the map" // default message for onLocationOutsideMapBounds
            },
            circleStyle: {
                color: '#136AEC',
                fillColor: '#136AEC',
                fillOpacity: 0.15,
                weight: 2,
                opacity: 0.5
            },
            // inner marker
            markerStyle: {
                color: '#136AEC',
                fillColor: '#2A93EE',
                fillOpacity: 0.7,
                weight: 2,
                opacity: 0.9,
                radius: 5
            },
            icon: 'fa fa-dot-circle-o',  // class for icon, fa-location-arrow or fa-map-marker
            //follow: true,
            setView: 'untilPan'
        });
        //if(! /Edge\/|Trident\/|MSIE /.test(window.navigator.userAgent)){
            this.lmap.lc = L.control.locate().addTo(this.lmap);

        //Adds debug inspector layers overlay to layers control
        //It gets all the layers from inspector layers API
        //debug layers can be enabled in config.js or as URL query:
        //?debug_layers=true
        if (otp.config.debug_layers === true) {
            var url = otp.config.hostname + '/' + otp.config.restService + '/inspector/layers';
            $.ajax(url, {
                dataType: 'JSON',
                success: function(data) {
                    var layers = {};
                    data.layers.map(function(layer) {
                        this.layer_control.addOverlay(new L.TileLayer(
                            otp.config.hostname + '/' + otp.config.restService + '/inspector/tile/' + layer.key + '/{z}/{x}/{y}.png',
                            { maxZoom : 22}), layer.name);
                    }, this_);

                }
            });
        }
        if(!otp.config.initLatLng) {
            var url = otp.config.hostname + '/' + otp.config.restService;
            $.ajax(url, {
                data: { routerId : otp.config.routerId },            
                dataType: 'JSON',
                success: function(data) {
                    this_.lmap.fitBounds([
                        [data.lowerLeftLatitude, data.lowerLeftLongitude],
                        [data.upperRightLatitude, data.upperRightLongitude]
                    ]);
                }
            });
        }
        
        var overlays = { };
        
        if(typeof otp.config.overlayTileUrl != 'undefined') {
	    	var overlayTileLayer = new L.TileLayer(otp.config.overlayTileUrl);
	    	//this.lmap.addLayer(overlayTileLayer);
	    	//overlays['Overlay'] = overlayTileLayer;
        }
        
        this.lmap.on('click', function(event) {
            webapp.mapClicked(event);        
        });

        this.lmap.on('viewreset', function(event) {
            webapp.mapBoundsChanged(event);        
        });

        this.lmap.on('dragend', function(event) {
            webapp.mapBoundsChanged(event);        
        });
        
        // setup context menu
        var this_ = this;
        
        this.contextMenu = new otp.core.MapContextMenu(this);
      
        this.activated = true;   
    },
    
    addContextMenuItem : function(text, clickHandler) {
        this.contextMenu.addModuleItem(text, clickHandler);
    },
    
    activeModuleChanged : function(oldModule, newModule) {
        
        console.log("actModChanged: "+ (oldModule ? oldModule.id : 'nessuno' )+", "+newModule.id);
        
        // hide module-specific layers for "old" module, if applicable
        if(oldModule != null) {
            for(var layerName in oldModule.mapLayers) {
                
                var layer = oldModule.mapLayers[layerName];
                this.lmap.removeLayer(layer);                
                //this.layerControl.removeLayer(layer);
            }
        }

        // show module-specific layers for "new" module
        for(var layerName in newModule.mapLayers) {
            var layer = newModule.mapLayers[layerName];
            this.lmap.addLayer(layer);
            var this_ = this;
        }
        
        // change default BaseLayer, if specified
        if(newModule.defaultBaseLayer) {
            for(layerName in this.baseLayers) {
                var baseLayer = this.baseLayers[layerName];
                if(layerName == newModule.defaultBaseLayer)
                    this.lmap.addLayer(baseLayer, true);
                else 
                    this.lmap.removeLayer(baseLayer);
            }
        }
        
        // refresh the map context menu
        this.contextMenu.clearModuleItems();
        newModule.addMapContextMenuItems();
    },
    
    setBounds : function(bounds)
    {
    	this.lmap.fitBounds(bounds);
    },
    
    $ : function() {
        return $("#map");
    },
    
    CLASS_NAME : "otp.core.Map"
});

