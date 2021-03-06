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

otp.namespace("otp.modules.planner");

var resourcePath = otp.config.resourcePath || "";

var StartFlagIcon = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/5t/marker-flag-start-'+ i18n.lng() +'.png',
        shadowUrl: null,
        iconSize: new L.Point(87, 48),
        iconAnchor: new L.Point(43, 48),
        popupAnchor: new L.Point(0, -48)
    }
});

var EndFlagIcon = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/5t/marker-flag-end-'+ i18n.lng() +'.png',
        shadowUrl: null,
        iconSize: new L.Point(87, 48),
        iconAnchor: new L.Point(43, 48),
        popupAnchor: new L.Point(0, -48)
    }
});


var StartBikeIcon = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/5t/bike/pick-up-bike.png',
        shadowUrl: null,
        iconSize: new L.Point(25, 39),
        iconAnchor: new L.Point(12, 36),
        popupAnchor: new L.Point(0, -36)
    }
});

var EndBikeIcon = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/5t/bike/drop-off-bike.png',
        shadowUrl: null,
        iconSize: new L.Point(25, 39),
        iconAnchor: new L.Point(12, 36),
        popupAnchor: new L.Point(0, -36)
    }
});


var SmallBlueIcon = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/marker-blue-sm.png',
        shadowUrl: null,
        iconSize: new L.Point(9, 16),
        iconAnchor: new L.Point(5, 16),
        popupAnchor: new L.Point(0, -16)
    }
});

var MediumBlueIcon = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/marker-blue-med.png',
        shadowUrl: null,
        iconSize: new L.Point(13, 23),
        iconAnchor: new L.Point(7, 23),
        popupAnchor: new L.Point(0, -23)
    }
});

var BlueNubIcon = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/marker-blue-nub.png',
        shadowUrl: null,
        iconSize: new L.Point(11, 8),
        iconAnchor: new L.Point(5, 8),
        popupAnchor: new L.Point(0, -8)
    }
});


var SmallIcon0Pct = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/5t/bike/marker-med-0pct.png',
        shadowUrl: null,
        iconSize: new L.Point(18, 28),
        iconAnchor: new L.Point(9, 28),
        popupAnchor: new L.Point(0, -28)
    }
});

var SmallIcon25Pct = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/5t/bike/marker-med-25pct.png',
        shadowUrl: null,
        iconSize: new L.Point(18, 28),
        iconAnchor: new L.Point(9, 28),
        popupAnchor: new L.Point(0, -28)
    }
});

var SmallIcon50Pct = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/5t/bike/marker-med-50pct.png',
        shadowUrl: null,
        iconSize: new L.Point(18, 28),
        iconAnchor: new L.Point(9, 28),
        popupAnchor: new L.Point(0, -28)
    }
});

var SmallIcon75Pct = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/5t/bike/marker-med-75pct.png',
        shadowUrl: null,
        iconSize: new L.Point(18, 28),
        iconAnchor: new L.Point(9, 28),
        popupAnchor: new L.Point(0, -28)
    }
});

var SmallIcon100Pct = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/5t/bike/marker-med-100pct.png',
        shadowUrl: null,
        iconSize: new L.Point(18, 28),
        iconAnchor: new L.Point(9, 28),
        popupAnchor: new L.Point(0, -28)
    }
});


var MediumIcon0Pct = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/marker-med-0pct.png',
        shadowUrl: null,
        iconSize: new L.Point(9, 16),
        iconAnchor: new L.Point(5, 16),
        popupAnchor: new L.Point(0, -16)
    }
});

var MediumIcon25Pct = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/marker-med-25pct.png',
        shadowUrl: null,
        iconSize: new L.Point(9, 16),
        iconAnchor: new L.Point(5, 16),
        popupAnchor: new L.Point(0, -16)
    }
});

var MediumIcon50Pct = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/marker-med-50pct.png',
        shadowUrl: null,
        iconSize: new L.Point(9, 16),
        iconAnchor: new L.Point(5, 16),
        popupAnchor: new L.Point(0, -16)
    }
});

var MediumIcon75Pct = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/marker-med-75pct.png',
        shadowUrl: null,
        iconSize: new L.Point(9, 16),
        iconAnchor: new L.Point(5, 16),
        popupAnchor: new L.Point(0, -16)
    }
});

var MediumIcon100Pct = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/marker-med-100pct.png',
        shadowUrl: null,
        iconSize: new L.Point(9, 16),
        iconAnchor: new L.Point(5, 16),
        popupAnchor: new L.Point(0, -16)
    }
});


var LargeIcon0Pct = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/marker-0pct.png',
        shadowUrl: null,
        iconSize: new L.Point(13, 23),
        iconAnchor: new L.Point(7, 23),
        popupAnchor: new L.Point(0, -23)
    }
});

var LargeIcon25Pct = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/marker-25pct.png',
        shadowUrl: null,
        iconSize: new L.Point(13, 23),
        iconAnchor: new L.Point(7, 23),
        popupAnchor: new L.Point(0, -23)
    }
});

var LargeIcon50Pct = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/marker-50pct.png',
        shadowUrl: null,
        iconSize: new L.Point(13, 23),
        iconAnchor: new L.Point(7, 23),
        popupAnchor: new L.Point(0, -23)
    }
});

var LargeIcon75Pct = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/marker-75pct.png',
        shadowUrl: null,
        iconSize: new L.Point(13, 23),
        iconAnchor: new L.Point(7, 23),
        popupAnchor: new L.Point(0, -23)
    }
});

var LargeIcon100Pct = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/marker-100pct.png',
        shadowUrl: null,
        iconSize: new L.Point(13, 23),
        iconAnchor: new L.Point(7, 23),
        popupAnchor: new L.Point(0, -23)
    }
});
// icone mip
/*
alert
traffico : new IconTraffico(),
lavori : new IconLavori(),
chiusura : new IconChiusura(),
nebbia : new IconNebbia(),
catene : new IconCatene(),
*/
var IconAlert = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/5t/marker/marker_alert.png',
        shadowUrl: null,
        iconSize: new L.Point(30, 36),
        iconAnchor: new L.Point(15, 36),
        popupAnchor: new L.Point(0, -36)
    }
});
var IconTraffico = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/5t/marker/marker_traffic_jam.png',
        shadowUrl: null,
        iconSize: new L.Point(30, 36),
        iconAnchor: new L.Point(15, 36),
        popupAnchor: new L.Point(0, -36)
    }
});
var IconLavori = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/5t/marker/marker_men_at_work.png',
        shadowUrl: null,
        iconSize: new L.Point(30, 36),
        iconAnchor: new L.Point(15, 36),
        popupAnchor: new L.Point(0, -36)
    }
});
var IconChiusura = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/5t/marker/marker_road_closed.png',
        shadowUrl: null,
        iconSize: new L.Point(30, 36),
        iconAnchor: new L.Point(15, 36),
        popupAnchor: new L.Point(0, -36)
    }
});
var IconNebbia = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/5t/marker/marker_fog.png',
        shadowUrl: null,
        iconSize: new L.Point(30, 36),
        iconAnchor: new L.Point(15, 36),
        popupAnchor: new L.Point(0, -36)
    }
});
var IconCatene = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/5t/marker/marker_road_snow.png',
        shadowUrl: null,
        iconSize: new L.Point(30, 36),
        iconAnchor: new L.Point(15, 36),
        popupAnchor: new L.Point(0, -36)
    }
});
var IconVento = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/5t/marker/marker_wind.png',
        shadowUrl: null,
        iconSize: new L.Point(30, 36),
        iconAnchor: new L.Point(15, 36),
        popupAnchor: new L.Point(0, -36)
    }
});
var IconIncidente = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/5t/marker/marker_car_accident.png',
        shadowUrl: null,
        iconSize: new L.Point(30, 36),
        iconAnchor: new L.Point(15, 36),
        popupAnchor: new L.Point(0, -36)
    }
});
var IconStradaAperta = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/5t/marker/marker_road_open.png',
        shadowUrl: null,
        iconSize: new L.Point(30, 36),
        iconAnchor: new L.Point(15, 36),
        popupAnchor: new L.Point(0, -36)
    }
});
var IconNeve = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/5t/marker/marker_snow.png',
        shadowUrl: null,
        iconSize: new L.Point(30, 36),
        iconAnchor: new L.Point(15, 36),
        popupAnchor: new L.Point(0, -36)
    }
});
var IconTemporale = L.Icon.extend({
    options: {
        iconUrl: resourcePath + 'images/5t/marker/marker_storm.png',
        shadowUrl: null,
        iconSize: new L.Point(30, 36),
        iconAnchor: new L.Point(15, 36),
        popupAnchor: new L.Point(0, -36)
    }
});



otp.modules.planner.IconFactory = otp.Class({
    
    startFlag : new StartFlagIcon(),
    endFlag : new EndFlagIcon(),
    
    startBike : new StartBikeIcon(),
    endBike : new EndBikeIcon(),
    
    smallBlue : new SmallBlueIcon(),    
    mediumBlue : new MediumBlueIcon(),
    blueNub : new BlueNubIcon(),
    
    small0 : new SmallIcon0Pct(),
    small25 : new SmallIcon25Pct(),
    small50 : new SmallIcon50Pct(),
    small75 : new SmallIcon75Pct(),
    small100 : new SmallIcon100Pct(),

    medium0 : new MediumIcon0Pct(),
    medium25 : new MediumIcon25Pct(),
    medium50 : new MediumIcon50Pct(),
    medium75 : new MediumIcon75Pct(),
    medium100 : new MediumIcon100Pct(),

    large0 : new LargeIcon0Pct(),
    large25 : new LargeIcon25Pct(),
    large50 : new LargeIcon50Pct(),
    large75 : new LargeIcon75Pct(),
    large100 : new LargeIcon100Pct(),
    
    lowerCutoff : 0.2,
    upperCutoff : 0.8,
    
    //mip
    alert : new IconAlert(),
    traffico : new IconTraffico(),
    lavori : new IconLavori(),
    chiusura : new IconChiusura(),
    nebbia : new IconNebbia(),
    catene : new IconCatene(),
    vento  : new IconVento(),
    incidente  : new IconIncidente(),
    stradaAperta  : new IconStradaAperta(),
    neve  : new IconNeve(),
    temporale  : new IconTemporale(),
    
    
    initialize : function() {
    },
    
    getEventMarker: function(event) {
        //console.log(event.style)
        if(event && event.style){
            if (event.style == 'traffico') return this.traffico
            if (event.style == 'lavori') return this.lavori
            if (event.style == 'chiusura') return this.chiusura
            if (event.style == 'nebbia') return this.nebbia
            if (event.style == 'catene') return this.catene
            if (event.style == 'vento') return this.vento
            if (event.style == 'incidente') return this.incidente
            if (event.style == 'stradaAperta') return this.stradaAperta
            if (event.style == 'neve') return this.neve
            if (event.style == 'temporale') return this.temporale
        }
        return this.alert;
    },
       
    getSmall : function(station) {
        var pct =  station.bikesAvailable / (station.bikesAvailable + station.spacesAvailable);
        if(pct == 0) return this.small0;
        if(pct == 1) return this.small100;
        if(pct <= this.lowerCutoff) return this.small25;
        if(pct >= this.upperCutoff) return this.small75;
        return this.small50;
    },   

    getMedium : function(station) {
        var pct =  station.bikesAvailable / (station.bikesAvailable + station.spacesAvailable);
        if(pct == 0) return this.medium0;
        if(pct == 1) return this.medium100;
        if(pct <= this.lowerCutoff) return this.medium25;
        if(pct >= this.upperCutoff) return this.medium75;
        return this.medium50;
    },   

    getLarge : function(station) {
        var pct =  station.bikesAvailable / (station.bikesAvailable + station.spacesAvailable);
        if(pct == 0) return this.large0;
        if(pct == 1) return this.large100;
        if(pct <= this.lowerCutoff) return this.large25;
        if(pct >= this.upperCutoff) return this.large75;
        return this.large50;
    },
    
    // mode bubble icons
    
    getModeBubble : function(quadrant, time, mode, isOrigin, highlight) {
        quadrant = quadrant.toLowerCase();
        mode = mode.toLowerCase();
        highlight = highlight || false;
        var html = '<div class="otp-itin-div-icon-topRow-'+quadrant[0]+'">';
        //if(!isOrigin) html += '<img src="'+otp.config.resourcePath+'images/mode/arrow.png" style="margin-right:2px;">';
        html += '<img src="'+otp.config.resourcePath+'images/5t/mode/'+mode+'.png">';
        //if(isOrigin) html += '<img src="'+otp.config.resourcePath+'images/mode/arrow.png" style="margin-left:2px;">';
        html += '</div>';
        //Removes AM/PM at the end of time if it exists (Time is too long
        //otherwise)
        //var time_format = (otp.config.locale.time.time_format.slice(-1) === 'a') ? otp.config.locale.time.time_format.slice(0, -1) : otp.config.locale.time.time_format;
        html +=  '<span>' + otp.util.Time.formatItinTime(time, otp.config.locale.time.time_format) + '</span>';
        
        if(quadrant === 'nw') anchor = [89,52];//[32,44];
        if(quadrant === 'ne') anchor = [0,52];//[0,44];
        if(quadrant === 'sw') anchor = [89,0];//[32,0];
        if(quadrant === 'se') anchor = [0,0];//[0,0];

        return L.divIcon({
            className: 'otp-itin-div-icon '+'otp-itin-div-icon-'+quadrant+(highlight ? "-highlight" : ""),
            iconSize: [89,52],
            iconAnchor: anchor,
            html: html 
        });
    },
                
    CLASS_NAME : "otp.modules.planner.IconFactory"
});    
