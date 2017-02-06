/* This program is free software: you can redistribute it and/or
 modify it under the terms of the GNU Lesser General Public License
 as published by the Free Software Foundation, either version 3 of
 the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>. */

package org.opentripplanner.updater.accessible_trip;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.List;

import javax.xml.parsers.ParserConfigurationException;

import org.onebusaway.gtfs.model.AgencyAndId;
import org.onebusaway.gtfs.model.Trip;
import org.opentripplanner.routing.graph.Graph;
import org.opentripplanner.updater.JsonConfigurable;
import org.opentripplanner.util.HttpUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xml.sax.SAXException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

// TODO This class could probably inherit from GenericJSONBikeRentalDataSource
/**
 * [ { "trip_id": "123456U", "accessible": 1 },
 * { "trip_id": "654321U", "accessible": 0 } ]
 */
public class GTTAccessibleTripDataSource implements AccessibleTripDataSource, JsonConfigurable {

    private static final Logger log = LoggerFactory.getLogger(GTTAccessibleTripDataSource.class);
    
    /**
     * Feed id that is used to match trip ids in the TripUpdates
     */
    private String feedId;

    private String url;

    ArrayList<Trip> trips = new ArrayList<Trip>();

    public GTTAccessibleTripDataSource() {

    }
    
    @Override
    public String getFeedId() {
        return this.feedId;
    }

    @Override
    public boolean update() {
        try {
            InputStream stream = HttpUtils.getData(url);
            if (stream == null) {
                log.warn("Failed to get data from url " + url);
                return false;
            }

            Reader reader = new BufferedReader(new InputStreamReader(stream,
                    Charset.forName("UTF-8")));
            StringBuilder builder = new StringBuilder();
            char[] buffer = new char[4096];
            int charactersRead;
            while ((charactersRead = reader.read(buffer, 0, buffer.length)) > 0) {
                builder.append(buffer, 0, charactersRead);
            }
            String data = builder.toString();

            parseJson(data);
        } catch (IOException e) {
            log.warn("Error reading accessible trip  feed from " + url, e);
            return false;
        } catch (ParserConfigurationException e) {
            throw new RuntimeException(e);
        } catch (SAXException e) {
            log.warn("Error parsing accessible trip feed from " + url + "(bad XML of some sort)", e);
            return false;
        }
        return true;
    }

    private void parseJson(String data) throws ParserConfigurationException, SAXException,
            IOException {
    	
        ArrayList<Trip> out = new ArrayList<Trip>();

        // Jackson ObjectMapper to read in JSON
        // TODO: test against real data
        ObjectMapper mapper = new ObjectMapper();
        for (JsonNode tripNode : mapper.readTree(data)) {
            Trip trip = new Trip();
            // We need string IDs but they are in JSON as numbers. Avoid null from textValue(). See pull req #1450.
            trip.setId(new AgencyAndId(feedId, tripNode.get("trip_id").textValue()));
            
            trip.setWheelchairAccessible(tripNode.get("accessible").intValue());
            if (trip != null && trip.getId() != null) {
                out.add(trip);
            }
        }
        synchronized (this) {
            trips = out;
        }
    }

    @Override
    public synchronized List<Trip> getTrips() {
        return trips;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    @Override
    public String toString() {
        return getClass().getName() + "(" + url + ")";
    }
    
    @Override
    public void configure(Graph graph, JsonNode config) {
        String url = config.path("url").asText();
        if (url == null) {
            throw new IllegalArgumentException("Missing mandatory 'url' configuration.");
        }
        this.url = url;
        this.feedId = config.path("feedId").asText();
    }

}
