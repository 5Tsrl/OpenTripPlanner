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

otp.namespace("otp.core");

/**
 * otp.core.GeocoderPelias is an alternative to the otp.core.GeocoderBuiltin geocoder
 * for usage with Pelias geocoder https://github.com/pelias/pelias
 * 
 * It will add a geocoder that can make requests to a Pelias geocoder instance or any similar API
 *
 * USAGE: Replace or add the geocoder config inside config.geocoders in config.js with:
 *
 * {
 *     name: 'Pelias geocoder',
 *     className: 'otp.core.GeocoderPelias',
 *     url: 'http://example.peliasurl.org/',
 *     addressParam: 'input'
 * }
 *
 * NOTE: the UI can handle multiple geocoders, it offers a dropdown in that case
 *
 */

otp.core.GeocoderPelias = otp.Class({

    initialize : function(url, addressParam, displayField) {
        this.url = url;
        this.addressParam = addressParam;
    },

    geocode : function(address, callback) {
        var params = {};
        params[this.addressParam] = address;
        var this_ = this;

        $.getJSON(this.url, params)
            .done( function (data) {
                // Success: transform the data to a JSON array of objects containing lat, lng, and description fields as the client expects
                data = data.features.map(function (f) {
                    return {
                        "description": f.properties.text != undefined ? f.properties.text : f.properties.hint,
                        "lat": f.geometry.coordinates[1],
                        "lng": f.geometry.coordinates[0]
                    };
                });
                callback.call(this, data);
            })
            .fail( function (err) {
                alert("Something went wrong retrieving the geocoder results from: " + this_.url + " for: " + address);
            });
    }
    ,
    reverse : function(latlng, callback) {
        var params = {};
        //params[this.addressParam] = address;
        params['lat'] = (Math.round(latlng.lat*100000)/100000);
        params['lng'] = (Math.round(latlng.lng*100000)/100000);
        var this_ = this;
        var revUrl = this.url.replace('suggest','reverse')

        $.getJSON(revUrl, params)
            .done( function (data) {
                var response = null;
                if(data.features.length>0){
                    var props = data.features[0].properties;
                    var response = props.name + ', ' + props.local_admin_name //+ ' ('+props.admin1_abbr +')'
                    if (props.admin1_abbr){ response += ' ('+props.admin1_abbr +')'}
                }
                callback.call(this, response);
            })
            .fail( function (err) {
                alert("Something went wrong retrieving the reverse geocoder result from: " + revUrl + " for: " + latlng.lat);
            });
    }
});
