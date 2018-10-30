package org.opentripplanner.updater.accessible_trip;

import java.util.List;
import org.onebusaway.gtfs.model.Trip;
/**
 * A dynamic source of accessible trips info for route calculation for impaired people.
 *
 * @author hannesj
 */
public interface AccessibleTripDataSource {

    /** Update the data from the source;
     * returns true if there might have been changes */
    boolean update();

    List<Trip> getTrips();

    public String getFeedId();

}
