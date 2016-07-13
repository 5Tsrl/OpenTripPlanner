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
        params['lat'] = latlng.lat;
        params['lng'] = latlng.lng;
        var this_ = this;
        var revUrl = this.url.replace('suggest','reverse')

        $.getJSON(revUrl, params)
            .done( function (data) {
                var response = null;
                if(data.features.length>0){
                    var props = data.features[0].properties;
                    var response = props.name + ', ' + props.local_admin_name + ' ('+props.admin1_abbr +')'
                }
                callback.call(this, response);
            })
            .fail( function (err) {
                alert("Something went wrong retrieving the reverse geocoder result from: " + revUrl + " for: " + latlng.lat);
            });
    }
});