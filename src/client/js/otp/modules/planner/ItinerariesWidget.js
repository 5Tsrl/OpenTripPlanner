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

otp.widgets.ItinerariesWidget =
    otp.Class(otp.widgets.Widget, {

    module : null,

    itinsAccord : null,
    footer : null,

    itineraries : null,
    activeIndex : 0,

    // set to true by next/previous/etc. to indicate to only refresh the currently active itinerary
    refreshActiveOnly : false,
    showButtonRow : true,
    showItineraryLink : true,
    showPrintLink : true,
    showEmailLink : false,
    showSearchLink : false,


    initialize : function(id, module) {
        this.module = module;

        otp.widgets.Widget.prototype.initialize.call(this, id, module, {
            //TRANSLATORS: Widget title
            title : _tr("Itineraries"),
            cssClass : module.itinerariesWidgetCssClass || 'otp-defaultItinsWidget',
            resizable : false,
            closeable : false,
            minimizable: false,
            draggable : false,
            persistOnClose : true,
            sonOf: '#tab1 .main',
        });
        //this.$().addClass('otp-itinsWidget');
        //this.$().resizable();
        //this.minimizable = true;
        //this.addHeader("X Itineraries Returned");
    },

    activeItin : function() {
        return this.itineraries[this.activeIndex];
    },

    updatePlan : function(plan) {
        this.updateItineraries(plan.itineraries, plan.queryParams);
    },

    updateItineraries : function(itineraries, queryParams, itinIndex) {

        var this_ = this;
        var divId = this.id+"-itinsAccord";

        if(this.minimized) this.unminimize();

        if(this.refreshActiveOnly == true) { // if only refreshing one itinerary; e.g. if next/prev was used

            // swap the old itinerary for the new one in both the TripPlan object and the local array
            var newItin = itineraries[0];
            var oldItin = this.itineraries[this.activeIndex];
            oldItin.tripPlan.replaceItinerary(this.activeIndex, newItin);
            this.itineraries[this.activeIndex] = newItin;

            // create an alert if we moved to another day
            var alerts = null;
            if(newItin.differentServiceDayFrom(oldItin)) {
                alerts = [ _tr("This itinerary departs on a different day from the previous one")];
            }

            // refresh all itinerary headers
            this.renderHeaders();

            // refresh the main itinerary content
            var itinContainer = $('#'+divId+'-'+this.activeIndex);
            itinContainer.empty();
            this.renderItinerary(newItin, this.activeIndex, alerts).appendTo(itinContainer);
            this.refreshActiveOnly = false;
            return;
        }

        this.itineraries = itineraries;

        this.clear();
        //TRANSLATORS: widget title
        this.setTitle(ngettext("%d Itinerary Returned", "%d Itineraries Returned", this.itineraries.length));

        var html = "<div id='"+divId+"' class='otp-itinsAccord'></div>";
        this.itinsAccord = $(html).appendTo(this.$());

        this.footer = $('<div class="otp-itinsWidget-footer" />').appendTo(this.$());
        if(this.showButtonRow && queryParams.mode !== "WALK" && queryParams.mode !== "BICYCLE") {
            this.renderButtonRow();
        }
        if(this.showSearchLink) {
            var link = this.constructLink(queryParams,
                                          jQuery.isFunction(this.module.getAdditionalUrlParams) ?
                                              this.module.getAdditionalUrlParams() : null);
                                          //TODO: Where does this link?
            $('<div class="otp-itinsWidget-searchLink">[<a href="'+link+'">'+_tr("Link to search")+'</a>]</div>').appendTo(this.footer);
        }

        var header;
        for(var i=0; i<this.itineraries.length; i++) {
            var itin = this.itineraries[i];
            //$('<h3><span id='+divId+'-headerContent-'+i+'>'+this.headerContent(itin, i)+'<span></h3>').appendTo(this.itinsAccord).click(function(evt) {
            //$('<h3>'+this.headerContent(itin, i)+'</h3>').appendTo(this.itinsAccord).click(function(evt) {

            var headerDivId = divId+'-headerContent-'+i;
            $('<h3 class="level1"><div id='+headerDivId+'></div></h3>')
            .appendTo(this.itinsAccord)
            .data('itin', itin)
            .data('index', i)
            .click(function(evt) {
                var itin = $(this).data('itin');
                this_.module.drawItinerary(itin);
                this_.activeIndex = $(this).data('index');
            });

            $('<div id="'+divId+'-'+i+'"></div>')
            .appendTo(this.itinsAccord)
            .append(this.renderItinerary(itin, i));
        }
        this.activeIndex = parseInt(itinIndex) || 0;

        this.itinsAccord.accordion({
            active: this.activeIndex,
            heightStyle: "fill",
            collapsible:true,
            header: ".level1"
        })/*.sortable({
            axis: "y",
            items: "> .level1",
            //handle:"h3",
            stop: function( event, ui ) {
              // IE doesn't register the blur when sorting
              // so trigger focusout handlers to remove .ui-state-focus
              //ui.item.children( "h3" ).triggerHandler( "focusout" );

              // Refresh accordion to handle new order
              $( this ).accordion( "refresh" );
            }
        })*/;
        /*
        this.itinsAccord.on('accordionactivate', function (event, ui) {
             // Accordion is not collapsed  planner-itinWidget-itinsAccord
            if (ui.newPanel.length) {
                $('#planner-itinWidget-itinsAccord').sortable('disable');
             // Accordion is collapsed
            } else {
                $('#planner-itinWidget-itinsAccord').sortable('enable');
            }
        });
        */
        // headers must be rendered after accordion is laid out to work around chrome layout bug
        /*for(var i=0; i<this.itineraries.length; i++) {
            var header = $("#"+divId+'-headerContent-'+i);
            this.renderHeaderContent(itineraries[i], i, header);
        }*/
        this.renderHeaders();
        this_.itinsAccord.accordion("resize");

        this.$().resize(function(){
            this_.itinsAccord.accordion("resize");
            this_.renderHeaders();
        });

        //raf this.$().draggable({ cancel: "#"+divId });

    },

    clear : function() {
        if(this.itinsAccord !== null) this.itinsAccord.remove();
        if(this.footer !== null) this.footer.remove();
    },

    renderButtonRow : function() {

        var serviceBreakTime = "03:00am";
        var this_ = this;
        var buttonRow = $("<div class='otp-itinsButtonRow'></div>").appendTo(this.footer);
        //TRANSLATORS: button to first itinerary
        /*
        $('<button>'+_tr("First")+'</button>').button().appendTo(buttonRow).click(function() {
            var itin = this_.itineraries[this_.activeIndex];
            var params = itin.tripPlan.queryParams;
            var stopId = itin.getFirstStopID();
            _.extend(params, {
                startTransitStopId :  stopId,
                date: moment(this_.module.date, otp.config.locale.time.date_format).format("MM-DD-YYYY"),
                time : serviceBreakTime,
                arriveBy : false
            });
            this_.refreshActiveOnly = true;
            this_.module.updateActiveOnly = true;
            this_.module.planTripFunction.call(this_.module, params);
        });
        */
        //TRANSLATORS: button to previous itinerary
        $('<button>'+_tr("Previous")+'</button>').button().appendTo(buttonRow).click(function() {
            var itin = this_.itineraries[this_.activeIndex];
            var params = itin.tripPlan.queryParams;
            var newEndTime = itin.itinData.endTime - 90000;
            var stopId = itin.getFirstStopID();
            _.extend(params, {
                startTransitStopId :  stopId,
                time : moment(newEndTime).format(otp.config.locale.time.time_format),
                date : moment(newEndTime).format(otp.config.locale.time.date_format),
                arriveBy : true
            });
            this_.refreshActiveOnly = true;
            this_.module.updateActiveOnly = true;
            this_.module.planTripFunction.call(this_.module, params);
        });
        //TRANSLATORS: button to next itinerary
        $('<button>'+_tr("Next")+'</button>').button().appendTo(buttonRow).click(function() {
            var itin = this_.itineraries[this_.activeIndex];
            var params = itin.tripPlan.queryParams;
            var newStartTime = itin.itinData.startTime + 90000;
            var stopId = itin.getFirstStopID();
            _.extend(params, {
                startTransitStopId :  stopId,
                time : moment(newStartTime).format(otp.config.locale.time.time_format),
                date : moment(newStartTime).format(otp.config.locale.time.date_format),
                arriveBy : false
            });
            this_.refreshActiveOnly = true;
            this_.module.updateActiveOnly = true;
            this_.module.planTripFunction.call(this_.module, params);
        });
        //TRANSLATORS: button to last itinerary
        /*
        $('<button>'+_tr("Last")+'</button>').button().appendTo(buttonRow).click(function() {
            var itin = this_.itineraries[this_.activeIndex];
            var params = itin.tripPlan.queryParams;
            var stopId = itin.getFirstStopID();
            _.extend(params, {
                startTransitStopId :  stopId,
                date : moment(this_.module.date, otp.config.locale.time.date_format).add(1,'days').format("MM-DD-YYYY"),
                time : serviceBreakTime,
                arriveBy : true
            });
            this_.refreshActiveOnly = true;
            this_.module.updateActiveOnly = true;
            this_.module.planTripFunction.call(this_.module, params);
        });
        */
    },

    // returns HTML text
    headerContent : function(itin, index) {
        // show number of this itinerary (e.g. "1.")
        //var html= '<div class="otp-itinsAccord-header-number">'+(index+1)+'.</div>';

        /*
        // show iconographic trip leg summary
        html += '<div class="otp-itinsAccord-header-icons">'+itin.getIconSummaryHTML()+'</div>';

        // show trip duration
        html += '<div class="otp-itinsAccord-header-duration">('+itin.getDurationStr()+')</div>';

        if(itin.groupSize) {
            html += '<div class="otp-itinsAccord-header-groupSize">[Group size: '+itin.groupSize+']</div>';
        } */

        var div = $('<div style="position: relative; height: 20px; background: yellow;"></div>');
        div.append('<div style="position:absolute; width: 20px; height: 20px; background: red;">'+(index+1)+'</div>');
        console.log("header div width: "+div.width());
        // clear div
        //html += '<div style="clear:both;"></div>';
        return div;
    },

    renderHeaders : function() {
        for(var i=0; i<this.itineraries.length; i++) {
            var header = $("#"+this.id+'-itinsAccord-headerContent-'+i);
            this.renderHeaderContent(this.itineraries[i], i, header);
        }
    },

    lg : function(deltaInMilli) {
        deltaMinutes = deltaInMilli/60000;
        if (deltaMinutes<1.5) deltaMinutes=1.5;
        return Math.log(deltaMinutes);
    },

    renderHeaderContent : function(itin, index, parentDiv) {
        parentDiv.empty();
        var divTimes = $('<div class="times"></div>');
        var partenza = moment(itin.itinData.startTime).format(otp.config.locale.time.time_format);
        var arrivo   = moment(itin.itinData.endTime).format(otp.config.locale.time.time_format);
        var durata   = moment.duration(itin.itinData.duration, 'seconds').format('H[h] mm[m]');
        divTimes.html(partenza + ' &rarr; '+ arrivo + ' <span class="duration"><span class="hidden">durata: </span>'+ durata + '</span>' );
        var div = $('<div class="summary-aux"></div>').appendTo(parentDiv);
        div.append(divTimes);
        var divGraficBar = $('<div class="graphicbar"></div>').appendTo(div);
        div.prepend('<div class="otp-itinsAccord-header-number"><span>'+(index+1)+'</span></div>');


        /*var maxSpan = itin.tripPlan.latestEndTime - itin.tripPlan.earliestStartTime;
        var startPct = (itin.itinData.startTime - itin.tripPlan.earliestStartTime) / maxSpan;
        var itinSpan = itin.getEndTime() - itin.getStartTime();
        var timeWidth = 38;//32;
        var startPx = 20+timeWidth, endPx = div.width()-timeWidth - (itin.groupSize ? 48 : 0);
        var pxSpan = endPx-startPx;
        var leftPx = Math.round(startPx + startPct * pxSpan);
        var widthPx = Math.round(pxSpan * (itinSpan / maxSpan));


        var timeStr = otp.util.Time.formatItinTime(itin.getStartTime(), otp.config.locale.time.time_format);
        div.append('<div class="otp-itinsAccord-header-time" style="left: '+(leftPx-timeWidth)+'px;">' + timeStr + '</div>');

        var timeStr = otp.util.Time.formatItinTime(itin.getEndTime(), otp.config.locale.time.time_format);
        div.append('<div class="otp-itinsAccord-header-time" style="left: '+(leftPx+widthPx+2)+'px;">' + timeStr + '</div>');*/

        /* Commented by Madeincima*/
        var maxSpan = itin.tripPlan.latestEndTime - itin.tripPlan.earliestStartTime;
        var startPct = (itin.itinData.startTime - itin.tripPlan.earliestStartTime) / maxSpan;
        var itinSpan = itin.getEndTime() - itin.getStartTime();
        var timeWidth = 38;
        var startPx = 20+timeWidth, endPx = div.width()-timeWidth - (itin.groupSize ? 48 : 0);
        var pxSpan = endPx-startPx;
        var leftPx = Math.round(startPx + startPct * pxSpan);
        var widthPx = Math.round(pxSpan * (itinSpan / maxSpan));

        //var maxSpan = itin.tripPlan.latestEndTime - itin.tripPlan.earliestStartTime;
        //var startPct = 0;
        //var itinSpan = 0;
        //var timeWidth = 0;
        //var startPx = 0, endPx = 100;
        //var pxSpan = endPx-startPx;
        //var leftPx = Math.round(startPx + startPct * pxSpan);
        //var widthPx = Math.round(pxSpan * (itinSpan / maxSpan));
        //var timeStr = otp.util.Time.formatItinTime(itin.getStartTime(), otp.config.locale.time.time_format);
        //var timeStr = otp.util.Time.formatItinTime(itin.getEndTime(), otp.config.locale.time.time_format);
        var lastTime = 0;
        var maxSpan = itin.itinData.duration*1000;
        var startTimeSpan = 0;
        var endTimeSpan = 0;
        var minPerc = 3;
        //console.log('maxSpan: ' + maxSpan);
        var totPercReserved = minPerc*(itin.itinData.legs.length);
        //console.log('totPercReserved: ' + totPercReserved);

        var maxSpanReserved = (maxSpan*totPercReserved)/100;
        //console.log('maxSpanReserved: ' + maxSpanReserved);

        var maxSpanReduced = maxSpan - maxSpanReserved;
        //console.log('maxSpanReduced: ' + maxSpanReduced);


        //maxSpan = itin.itinData.duration*1000;

        for(var l=0; l<itin.itinData.legs.length; l++) {
            var leg = itin.itinData.legs[l];
            var waitIsset = false;

            if(lastTime!=leg.startTime && lastTime!=0){
                var legTimePerc = ((leg.startTime - lastTime)*100)/maxSpan;
                if(legTimePerc>=1){
                    var segment = $('<div class="otp-itinsAccord-header-segment wait" />').css({
                        width: legTimePerc+'%'
                    }).appendTo(divGraficBar);
                    waitIsset = true;
                }

            }

            var legTimePerc = (((leg.endTime - leg.startTime)*(100-(totPercReserved + 4)))/maxSpan) + minPerc;

            var border = '';

            if(!waitIsset && l!=0){
                border = '<span class="border"></span>';
                //console.log('---test2---');
            }
            var segment = $('<div class="otp-itinsAccord-header-segment">'+border+'</div>').css({
                width: legTimePerc+'%',
                background: this.getModeColor(leg.mode)+' url('+otp.config.resourcePath+'images/5t/mode/'+leg.mode.toLowerCase()+'.png) 50% 50% no-repeat'
            }).appendTo(divGraficBar);

            /*var showRouteLabel = widthPx > 10 && otp.util.Itin.isTransit(leg.mode) && leg.routeShortName && leg.routeShortName.length <= 6;
            if(showRouteLabel) segment.append('<div title="'+ leg.routeShortName +'">'+leg.routeShortName+'</div>');*/

            lastTime = leg.endTime;

            //alert(maxSpan);
           /* var startPct = (leg.startTime - itin.tripPlan.earliestStartTime) / maxSpan;
            var endPct = (leg.endTime - itin.tripPlan.earliestStartTime) / maxSpan;
            var leftPx = Math.round(startPct * pxSpan);
            var widthPx = Math.round(pxSpan * (leg.endTime - leg.startTime) / maxSpan );*/


            //div.append('<div class="otp-itinsAccord-header-segment" style="width: '+widthPx+'px; left: '+leftPx+'px; background: '+this.getModeColor(leg.mode)+' url(images/mode/'+leg.mode.toLowerCase()+'.png) center no-repeat;"></div>');

            /*var showRouteLabel = widthPx > 10 && otp.util.Itin.isTransit(leg.mode) && leg.routeShortName && leg.routeShortName.length <= 6;
            var segment = $('<div class="otp-itinsAccord-header-segment" />')
            .css({
                width: widthPx+'%',
                left: leftPx+'%',
                //background: this.getModeColor(leg.mode)
                background: this.getModeColor(leg.mode)+' url('+otp.config.resourcePath+'images/5t/mode/'+leg.mode.toLowerCase()+'.png) 30% 50% no-repeat'
            })
            .appendTo(divGraficBar);
            //if(showRouteLabel) segment.append('<div style="margin-left:'+(widthPx/2+9)+'px;" title="'+ leg.routeShortName +'">'+leg.routeShortName+'</div>');
            if(showRouteLabel) segment.append('<div style="margin-left:45%;" title="'+ leg.routeShortName +'">'+leg.routeShortName+'</div>');*/

        }

        if(itin.groupSize) {
            var segment = $('<div class="otp-itinsAccord-header-groupSize">'+itin.groupSize+'</div>')
            .appendTo(divGraficBar);
        }

    },

    getModeColor : function(mode) {
        if(mode === "WALK") return '#97ba43';
        if(mode === "BICYCLE") return '#f0cc3b';
        if(mode === "SUBWAY") return '#d03939';
        if(mode === "RAIL") return '#5a95c7';
        if(mode === "BUS") return '#f0952a';
        if(mode === "TRAM") return '#f0952a';
        if(mode === "CAR") return '#444';
        if(mode === "AIRPLANE") return '#f0f';
        return '#aaa';
    },


    municoderResultId : 0,

    // returns jQuery object
    renderItinerary : function(itin, index, alerts) {
        var this_ = this;

        // render legs
        var divId = this.module.id+"-itinAccord-"+index;
        var accordHtml = "<div id='"+divId+"' class='otp-itinAccord'></div>";
        var itinAccord = $(accordHtml);
        for(var l=0; l<itin.itinData.legs.length; l++) {

            var legDiv = $('<div />').appendTo(itinAccord);

            var leg = itin.itinData.legs[l];
            //TRANSLATORS: Used when passengers can stay on vehicle. Continues
            //as [agency] route name
            var headerModeText = leg.interlineWithPreviousLeg ? _tr("CONTINUES AS") : otp.util.Itin.modeString(leg.mode).toUpperCase()
            var headerHtml = "<b>" + headerModeText + "</b>";

            // Add info about realtimeness of the leg
            if (leg.realTime && typeof(leg.arrivalDelay) === 'number') {
                var minDelay = Math.round(leg.arrivalDelay / 60)
                if (minDelay > 0) {
                    //TRANSLATORS: Something in Public transport is x minutes late
                    headerHtml += ' <span style="color:red;">(' + ngettext("%d min late", "%d mins late", minDelay) + ')</span>';
                } else if (minDelay < 0) {
                    //TRANSLATORS: Something in Public transport is x minutes early
                    headerHtml += ' <span style="color:green;">(' + ngettext("%d min early", "%d mins early", (minDelay * -1)) + ')</span>';
                } else {
                    //TRANSLATORS: Something in Public transport is on time
                    headerHtml += ' <span style="color:green;">(' + _tr("on time") + ')</span>';
                }
            }

            if(leg.mode === "WALK" || leg.mode === "BICYCLE" || leg.mode === "CAR") {
                headerHtml += " "+otp.util.Itin.distanceString(leg.distance)+ pgettext("direction", " to ")+otp.util.Itin.getName(leg.to);
                if(otp.config.municoderHostname) {
                    var spanId = this.newMunicoderRequest(leg.to.lat, leg.to.lon);
                    headerHtml += '<span id="'+spanId+'"></span>';
                }
            }
            else if(leg.agencyId !== null) {
                //headerHtml += ": "+leg.agencyId+", ";
                headerHtml += " ";
                if(leg.route !== leg.routeLongName) {
                    //headerHtml += "("+leg.route+") ";
                    //headerHtml += leg.route+" ";
                    if(leg.mode === "RAIL"){
                        headerHtml += parseInt(leg.tripShortName) + " ";
                    } else {
                        headerHtml += leg.route+" ";
                    }

                }
                //headerHtml += "("+leg.agencyId+") ";
                headerHtml += '(<a href="'+leg.agencyUrl + '">'+leg.agencyName+'</a>) ';
                if (leg.routeLongName) {
                    headerHtml += leg.routeLongName;
                }

                if(leg.headsign) {
                    /*TRANSLATORS: used in sentence like: <Long name of public transport route> "to" <Public transport
                    headsign>. Used in showing itinerary*/
                    headerHtml +=  pgettext("bus_direction", " to ") + leg.headsign;
                }

                if(leg.alerts) {
                    headerHtml += '&nbsp;&nbsp;<img src="images/alert.png" style="vertical-align: -20%;" />';
                }
            }

            $("<h3>"+headerHtml+"</h3>").appendTo(legDiv).data('leg', leg).hover(function(evt) {
                //var arr = evt.target.id.split('-');
                //var index = parseInt(arr[arr.length-1]);
                var thisLeg = $(this).data('leg');
                this_.module.highlightLeg(thisLeg);
                this_.module.pathMarkerLayer.clearLayers();
                this_.module.drawStartBubble(thisLeg, true);
                this_.module.drawEndBubble(thisLeg, true);
            }, function(evt) {
                this_.module.clearHighlights();
                this_.module.pathMarkerLayer.clearLayers();
                this_.module.drawAllStartBubbles(itin);
            });
            this_.renderLeg(leg,
                            l>0 ? itin.itinData.legs[l-1] : null, // previous
                            l+1 < itin.itinData.legs.length ? itin.itinData.legs[l+1] : null // next
            ).appendTo(legDiv);

            $(legDiv).accordion({
                header : 'h3',
                //active: otp.util.Itin.isTransit(leg.mode) ? 0 : false,
                active:0,
                heightStyle: "content",
                collapsible: true
            });

            $(legDiv).find("h3 a").click(function() {
                //window.location = $(this).attr('href');
                window.open($(this).attr('href'), '_blank');
                return false;
            });
        }

        //itinAccord.accordion({
        /*console.log('#' + divId + ' > div')
        $('#' + divId + ' > div').accordion({
            header : 'h3',
            active: false,
            heightStyle: "content",
            collapsible: true
        });*/

        var itinDiv = $("<div></div>");

        // add alerts, if applicable
        alerts = alerts || [];

        // create an alert if this is a different day from the searched day
        var queryParamTime;
        if(! itin.tripPlan.queryParams.time){
          queryParamTime = moment().format('HH:mm')
        } else {
          queryParamTime = moment(itin.tripPlan.queryParams.time, otp.config.locale.time.time_format).format('HH:mm')
        }
        var queryTime = itin.tripPlan.queryParams.date + ' ' + queryParamTime;
        queryTime = moment(queryTime, 'YYYY-MM-DD HH:mm').unix()*1000
        if(itin.differentServiceDayFromQuery(queryTime)) {
            //TRANSLATORS: Shown as alert text before showing itinerary.
            alerts = [ _tr("This itinerary departs on a different day than the one searched for")];
        }

        // check for max walk exceedance
        var maxWalkExceeded = false;
        for(var i=0; i<itin.itinData.legs.length; i++) {
            var leg = itin.itinData.legs[i];
            if(leg.mode === "WALK" && leg.distance > itin.tripPlan.queryParams.maxWalkDistance) {
                maxWalkExceeded = false;
                break;
            }
        }
        if(maxWalkExceeded) {
            //TRANSLATORS: Shown as alert text before showing itinerary.
            alerts.push(_tr("Total walk distance for this trip exceeds specified maximum"));
        }

        for(var i = 0; i < alerts.length; i++) {
            itinDiv.append("<div class='otp-itinAlertRow'>"+alerts[i]+"</div>");
        }

        // add start and end time rows and the main leg accordion display
        //TRANSLATORS: Start: Time and date (Shown before path itinerary)
        itinDiv.append("<div class='otp-itinStartRow'><b>" + pgettext('template', "Start") + "</b>: "+itin.getStartTimeStr()+"</div>");
        itinDiv.append(itinAccord);
        //TRANSLATORS: End: Time and date (Shown after path itinerary)
        itinDiv.append("<div class='otp-itinEndRow'><b>" + _tr("End") + "</b>: "+itin.getEndTimeStr()+"</div>");

        // add trip summary

        var tripSummary = $('<div class="otp-itinTripSummary" />')
        .append('<div class="otp-itinTripSummaryHeader">' + _tr("Trip Summary") + '</div>')
        //TRANSLATORS: Travel: hour date on which this trip is made
        .append('<div class="otp-itinTripSummaryLabel">' + _tr("Travel") + '</div><div class="otp-itinTripSummaryText">'+itin.getStartTimeStr()+'</div>')
        //TRANSLATORS: Time: minutes How long is this trip
        .append('<div class="otp-itinTripSummaryLabel">' + _tr("Time") + '</div><div class="otp-itinTripSummaryText">'+itin.getDurationStr()+'</div>');

        var walkDistance = itin.getModeDistance("WALK");
        if(walkDistance > 0) {
            //FIXME: If translation is longer transfers jumps to the right and
            //it is ugly

            //TRANSLATORS: Total foot distance for trip
            tripSummary.append('<div class="otp-itinTripSummaryLabel">' + _tr("Total Walk") + '</div><div class="otp-itinTripSummaryText">' +
                otp.util.Itin.distanceString(walkDistance) + '</div>')
        }

        var bikeDistance = itin.getModeDistance("BICYCLE");
        if(bikeDistance > 0) {
            //TRANSLATORS: Total distance on a bike for this trip
            tripSummary.append('<div class="otp-itinTripSummaryLabel">' + _tr("Total Bike") + '</div><div class="otp-itinTripSummaryText">' +
                otp.util.Itin.distanceString(bikeDistance) + '</div>')
        }

        var carDistance = itin.getModeDistance("CAR");
        if(carDistance > 0) {
            //TRANSLATORS: Total distance in a car for this trip
            tripSummary.append('<div class="otp-itinTripSummaryLabel">' + _tr("Total drive") + '</div><div class="otp-itinTripSummaryText">' +
                otp.util.Itin.distanceString(carDistance) + '</div>')
        }

        if(itin.hasTransit) {
            //TRANSLATORS: how many public transit transfers in a trip
            tripSummary.append('<div class="otp-itinTripSummaryLabel">' + _tr("Transfers") + '</div><div class="otp-itinTripSummaryText">'+itin.itinData.transfers+'</div>')
            /*if(itin.itinData.walkDistance > 0) {
                tripSummary.append('<div class="otp-itinTripSummaryLabel">' + _tr("Total Walk") + '</div><div class="otp-itinTripSummaryText">' +
                    otp.util.Itin.distanceString(itin.itinData.walkDistance) + '</div>')
            }*/
           //TRANSLATORS: cost of trip
            tripSummary.append('<div class="otp-itinTripSummaryLabel">' + _tr("Fare") +'</div><div class="otp-itinTripSummaryText">'+itin.getFareStr()+'</div>');
        }



        var tripSummaryFooter = $('<div class="otp-itinTripSummaryFooter" />');

        //TRANSLATORS: Valid date time; When is this trip correct
        tripSummaryFooter.append(_tr('Valid') + ' ' + moment().format(otp.config.locale.time.format));

        var itinLink = this.constructLink(itin.tripPlan.queryParams, { itinIndex : index });
        //console.log(itinLink);
        if(this.showItineraryLink) {
            //TRANSLATORS: Links to this itinerary
            tripSummaryFooter.append(' | <a href="'+itinLink+'">' + _tr("Link to Itinerary") + '</a>');
        }

        if(this.showPrintLink) {
            tripSummaryFooter.append(' | ');
            $('<a href="#">' + _tr('Print') +'</a>').click(function(evt) {
                evt.preventDefault();

                var printWindow = window.open('','OpenTripPlanner Results','toolbar=yes, scrollbars=yes, height=500, width=800');
                printWindow.document.write(itin.getHtmlNarrative());

            }).appendTo(tripSummaryFooter);
        }
        if(this.showEmailLink) {
            //TRANSLATORS: Default subject when sending trip to email
            var subject = _tr("Your Trip");
            var body = itin.getTextNarrative(itinLink);
            //TRANSLATORS: Link to send trip by email
            tripSummaryFooter.append(' | <a href="mailto:?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body)+'" target="_blank">' + _tr("Email") + '</a>');
        }

        tripSummary.append(tripSummaryFooter)
        .appendTo(itinDiv);


        return itinDiv;
    },

    renderLeg : function(leg, previousLeg, nextLeg) {
        var this_ = this;
        if(otp.util.Itin.isTransit(leg.mode)) {
            var legDiv = $('<div></div>');

            // show the start time and stop

            // prevaricate if this is a nonstruct frequency trip
            if( leg.isNonExactFrequency === true ){
                //TRANSLATORS: public transport drives every N minutes
                $('<div class="otp-itin-leg-leftcol">' + ngettext("every %d min", "every %d mins", (leg.headway/60))+"</div>").appendTo(legDiv);
            } else {
                $('<div class="otp-itin-leg-leftcol">'+otp.util.Time.formatItinTime(leg.startTime, otp.config.locale.time.time_format)+"</div>").appendTo(legDiv);
            }

            //TRANSLATORS: Depart station / Board at station in itinerary
            var startHtml = '<div class="otp-itin-leg-endpointDesc">' + (leg.interlineWithPreviousLeg ? "<b>" + pgettext("itinerary", "Depart") + "</b> " : _tr("<b>Board</b> at ")) +leg.from.name;
            if(otp.config.municoderHostname) {
                var spanId = this.newMunicoderRequest(leg.from.lat, leg.from.lon);
                startHtml += '<span id="'+spanId+'"></span>';
            }
            startHtml += '</div>';

            $(startHtml).appendTo(legDiv)
            .click(function(evt) {
                this_.module.webapp.map.lmap.panTo(new L.LatLng(leg.from.lat, leg.from.lon));
            }).hover(function(evt) {
                this_.module.pathMarkerLayer.clearLayers();
                this_.module.drawStartBubble(leg, true);
            }, function(evt) {
                this_.module.pathMarkerLayer.clearLayers();
                this_.module.drawAllStartBubbles(this_.itineraries[this_.activeIndex]);
            });

            var stopHtml = '<div class="otp-itin-leg-endpointDescSub">';
            /*if( typeof leg.from.stopCode != 'undefined' ) {
                stopHtml += _tr("Stop") + ' #'+leg.from.stopCode+ ' ';
            }*/
            stopHtml += '[<a href="#" >' + _tr("Stop Viewer") +'</a>]</div>';

            $(stopHtml)
            .appendTo(legDiv)

            .click(function(evt) {/*
                var modalboxWidget_html = ich['otp-stopViewer']()
                console.log(modalboxWidget_html)
                //$('body').append(modalboxWidget_html)
                $('.modalboxWidget').magnificPopup({
                    items:[
                        //{src:$('<div class=" white-popup">Dynamically created element</div>')}
                        {src:$(modalboxWidget_html)}
                    ],
            		type:'inline',
            		midClick: true // Allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source in href.
            	});
                */

                if(!this_.module.stopViewerWidget) {
                    this_.module.stopViewerWidget = new otp.widgets.transit.StopViewerWidget("otp-"+this_.module.id+"-stopViewerWidget", this_.module);
                    //raf devo chiamare inizialize a mano
                    this_.module.stopViewerWidget.inizialize()
                    this_.module.stopViewerWidget.$().offset({top: evt.clientY, left: evt.clientX});
                }
                this_.module.stopViewerWidget.show();
                this_.module.stopViewerWidget.setActiveTime(leg.startTime);
                this_.module.stopViewerWidget.setStop(leg.from.stopId, leg.from.name);
                this_.module.stopViewerWidget.bringToFront();

                $.magnificPopup.open({
                  items: {
                    src: this_.module.stopViewerWidget.mainDiv,
                    type: 'inline'
                  }
                });


            });



            $('<div class="otp-itin-leg-buffer"></div>').appendTo(legDiv);

            // show the "time in transit" line

            var inTransitDiv = $('<div class="otp-itin-leg-elapsedDesc" />').appendTo(legDiv);

            $('<span><i>' + _tr("Time in transit") + ": " + otp.util.Time.secsToHrMin(leg.duration)+'</i></span>').appendTo(inTransitDiv);

            $('<span>&nbsp;[<a href="#">' + _tr("Trip Viewer") + '</a>]</span>')
            .appendTo(inTransitDiv)
            .click(function(evt) {
                if(!this_.module.tripViewerWidget) {
                    this_.module.tripViewerWidget = new otp.widgets.transit.TripViewerWidget("otp-"+this_.module.id+"-tripViewerWidget", this_.module);
                    //this_.module.tripViewerWidget.inizialize();
                    this_.module.tripViewerWidget.$().offset({top: evt.clientY, left: evt.clientX});
                }
                this_.module.tripViewerWidget.show();
                //if(this_.module.tripViewerWidget.minimized) this_.module.tripViewerWidget.unminimize();
                this_.module.tripViewerWidget.update(leg);
                this_.module.tripViewerWidget.bringToFront();

                $.magnificPopup.open({
                  items: {
                    src: this_.module.tripViewerWidget.mainDiv,
                    type: 'inline'
                  }
                });
            });

            // show the intermediate stops, if applicable -- REPLACED BY TRIP VIEWER

            /*if(this.module.showIntermediateStops) {

                $('<div class="otp-itin-leg-buffer"></div>').appendTo(legDiv);
                var intStopsDiv = $('<div class="otp-itin-leg-intStops"></div>').appendTo(legDiv);

                var intStopsListDiv = $('<div class="otp-itin-leg-intStopsList"></div>')

                $('<div class="otp-itin-leg-intStopsHeader">'+leg.intermediateStops.length+' Intermediate Stops</div>')
                .appendTo(intStopsDiv)
                .click(function(event) {
                    intStopsListDiv.toggle();
                });

                intStopsListDiv.appendTo(intStopsDiv);

                for(var i=0; i < leg.intermediateStops.length; i++) {
                    var stop = leg.intermediateStops[i];
                    $('<div class="otp-itin-leg-intStopsListItem">'+(i+1)+'. '+stop.name+' (ID #'+stop.stopId.id+')</div>').
                    appendTo(intStopsListDiv)
                    .data("stop", stop)
                    .click(function(evt) {
                        var stop = $(this).data("stop");
                        this_.module.webapp.map.lmap.panTo(new L.LatLng(stop.lat, stop.lon));
                    }).hover(function(evt) {
                        var stop = $(this).data("stop");
                        $(this).css('color', 'red');
                        var popup = L.popup()
                            .setLatLng(new L.LatLng(stop.lat, stop.lon))
                            .setContent(stop.name)
                            .openOn(this_.module.webapp.map.lmap);
                    }, function(evt) {
                        $(this).css('color', 'black');
                        this_.module.webapp.map.lmap.closePopup();
                    });
                }
                intStopsListDiv.hide();
            }*/

            // show the end time and stop

            $('<div class="otp-itin-leg-buffer"></div>').appendTo(legDiv);

            if( leg.isNonExactFrequency === true ) {
                $('<div class="otp-itin-leg-leftcol">' + _tr('late as') + ' ' + otp.util.Time.formatItinTime(leg.endTime, otp.config.locale.time.time_format)+"</div>").appendTo(legDiv);
            } else {
                $('<div class="otp-itin-leg-leftcol">'+otp.util.Time.formatItinTime(leg.endTime, otp.config.locale.time.time_format)+"</div>").appendTo(legDiv);
            }

            //TRANSLATORS: Stay on board/Alight [at stop name]
            var endAction = (nextLeg && nextLeg.interlineWithPreviousLeg) ? _tr("Stay on board") : _tr("Alight");
            //TRANSLATORS: [Stay on board/Alight] at [stop name]
            var endHtml = '<div class="otp-itin-leg-endpointDesc"><b>' + endAction + '</b> ' + _tr('at')+ ' ' +leg.to.name;
            if(otp.config.municoderHostname) {
                spanId = this.newMunicoderRequest(leg.to.lat, leg.to.lon);
                endHtml += '<span id="'+spanId+'"></span>';
            }
            endHtml += '</div>';

            $(endHtml).appendTo(legDiv)
            .click(function(evt) {
                this_.module.webapp.map.lmap.panTo(new L.LatLng(leg.to.lat, leg.to.lon));
            }).hover(function(evt) {
                this_.module.pathMarkerLayer.clearLayers();
                this_.module.drawEndBubble(leg, true);
            }, function(evt) {
                this_.module.pathMarkerLayer.clearLayers();
                this_.module.drawAllStartBubbles(this_.itineraries[this_.activeIndex]);
            });


            // render any alerts

            if(leg.alerts) {
                console.log('GOT ALERTS!!',leg.alerts)
                for(var i = 0; i < leg.alerts.length; i++) {
                    var alert = leg.alerts[i];

                    var alertDiv = ich['otp-planner-alert']({ alert: alert, leg: leg }).appendTo(legDiv);
                    alertDiv.find('.otp-itin-alert-description').hide();

                    alertDiv.find('.otp-itin-alert-toggleButton').data('div', alertDiv).click(function() {
                        var div = $(this).data('div');
                        var desc = div.find('.otp-itin-alert-description');
                        var toggle = div.find('.otp-itin-alert-toggleButton');
                        if(desc.is(":visible")) {
                            desc.slideUp();
                            toggle.html("&#x25BC;");
                        }
                        else {
                            desc.slideDown();
                            toggle.html("&#x25B2;");
                        }
                    });
                }
            }

            return legDiv;
        }
        else if (leg.steps) { // walk / bike / car
            var legDiv = $('<div></div>');
            if (leg && leg.steps) {
                for(var i=0; i<leg.steps.length; i++) {
                    var step = leg.steps[i];
                    var text = otp.util.Itin.getLegStepText(step);

                    var html = '<div id="foo-'+i+'" class="otp-itin-step-row">';
                    html += '<div class="otp-itin-step-icon">';
                    if(step.relativeDirection)
                        html += '<img src="'+otp.config.resourcePath+'images/5t/directions/' +
                            step.relativeDirection.toLowerCase()+'.png">';
                    html += '</div>';
                    var distArr= otp.util.Itin.distanceString(step.distance).split(" ");
                    html += '<div class="otp-itin-step-dist">' +
                        '<span style="font-weight:bold; font-size: 1.2em;">' +
                        distArr[0]+'</span><br>'+distArr[1]+'</div>';
                    html += '<div class="otp-itin-step-text">'+text+'</div>';
                    html += '<div style="clear:both;"></div></div>';

                    $(html).appendTo(legDiv)
                    .data("step", step)
                    .data("stepText", text)
                    .click(function(evt) {
                        var step = $(this).data("step");
                        this_.module.webapp.map.lmap.panTo(new L.LatLng(step.lat, step.lon));
                    }).hover(function(evt) {
                        var step = $(this).data("step");
                        $(this).css('background', '#f0f0f0');
                        var popup = L.popup()
                            .setLatLng(new L.LatLng(step.lat, step.lon))
                            .setContent($(this).data("stepText"))
                            .openOn(this_.module.webapp.map.lmap);
                    }, function(evt) {
                        $(this).css('background', '#e8e8e8');
                        this_.module.webapp.map.lmap.closePopup();
                    });
                }
            }
            return legDiv;
        }
        return $("<div>Leg details go here</div>");
    },

    constructLink : function(queryParams, additionalParams) {
        //raf reformat date as locale, while speak iso 8601 with server
        //queryParams.date = moment(queryParams.date).format(otp.config.locale.time.date_format);
        additionalParams = additionalParams ||  { };
        return otp.config.siteUrl + '?module=' + this.module.id + "&" +
            otp.util.Text.constructUrlParamString(_.extend(_.clone(queryParams), additionalParams));
    },

    newMunicoderRequest : function(lat, lon) {

        this.municoderResultId++;
        var spanId = 'otp-municoderResult-'+this.municoderResultId;

        console.log("muniReq");
        $.ajax(otp.config.municoderHostname+"/opentripplanner-municoder/municoder", {

            data : { location : lat+","+lon },
            dataType:   'jsonp',

            success: function(data) {
                if(data.name) {
                    $('#'+spanId).html(", "+data.name);
                }
            }
        });
        return spanId;
    }


});
