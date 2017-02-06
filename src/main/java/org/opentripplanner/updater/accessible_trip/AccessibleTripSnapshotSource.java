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

import java.text.ParseException;
import java.util.ArrayList;
import java.util.BitSet;
import java.util.Calendar;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TimeZone;
import java.util.concurrent.locks.ReentrantLock;

import org.onebusaway.gtfs.model.Agency;
import org.onebusaway.gtfs.model.AgencyAndId;
import org.onebusaway.gtfs.model.Route;
import org.onebusaway.gtfs.model.Stop;
import org.onebusaway.gtfs.model.StopTime;
import org.onebusaway.gtfs.model.Trip;
import org.onebusaway.gtfs.model.calendar.ServiceDate;
import org.opentripplanner.model.StopPattern;
import org.opentripplanner.routing.edgetype.Timetable;
import org.opentripplanner.routing.edgetype.TimetableSnapshot;
import org.opentripplanner.routing.edgetype.TripPattern;
import org.opentripplanner.routing.graph.Graph;
import org.opentripplanner.routing.graph.GraphIndex;
import org.opentripplanner.routing.trippattern.RealTimeState;
import org.opentripplanner.routing.trippattern.TripTimes;
import org.opentripplanner.updater.GtfsRealtimeFuzzyTripMatcher;
import org.opentripplanner.updater.stoptime.TripPatternCache;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.base.Preconditions;
import com.google.common.collect.Maps;
import com.google.transit.realtime.GtfsRealtime.TripDescriptor;
import com.google.transit.realtime.GtfsRealtime.TripUpdate;
import com.google.transit.realtime.GtfsRealtime.TripUpdate.StopTimeUpdate;

/**
 * This class should be used to create snapshots of lookup tables of realtime data (trip accessibility info). This is
 * necessary to provide planning threads a consistent constant view of a graph with realtime data at
 * a specific point in time.
 */
public class AccessibleTripSnapshotSource {
    private static final Logger LOG = LoggerFactory.getLogger(AccessibleTripSnapshotSource.class);


    /**
     * Maximum time in seconds since midnight for arrivals and departures
     */
    //private static final long MAX_ARRIVAL_DEPARTURE_TIME = 48 * 60 * 60;

    public int logFrequency = 2000;

    private int appliedBlockCount = 0;

    /**
     * If a timetable snapshot is requested less than this number of milliseconds after the previous
     * snapshot, just return the same one. Throttles the potentially resource-consuming task of
     * duplicating a TripPattern -> Timetable map and indexing the new Timetables.
     */
    public int maxSnapshotFrequency = 1000; // msec

    /**
     * The last committed snapshot that was handed off to a routing thread. This snapshot may be
     * given to more than one routing thread if the maximum snapshot frequency is exceeded.
     */
    private volatile TimetableSnapshot snapshot = null;

    /**
     * The working copy of the timetable snapshot. Should not be visible to routing threads. Should
     * only be modified by a thread that holds a lock on {@link #bufferLock}. All public methods that
     * might modify this buffer will correctly acquire the lock.
     */
    private final TimetableSnapshot buffer = new TimetableSnapshot();

    /**
     * Lock to indicate that buffer is in use
     */
    private final ReentrantLock bufferLock = new ReentrantLock(true);


    /** Should expired realtime data be purged from the graph. */
    public boolean purgeExpiredData = true;

    protected ServiceDate lastPurgeDate = null;

    protected long lastSnapshotTime = -1;

    private final TimeZone timeZone;

    private final GraphIndex graphIndex;

    public GtfsRealtimeFuzzyTripMatcher fuzzyTripMatcher;

    public AccessibleTripSnapshotSource(final Graph graph) {
        timeZone = graph.getTimeZone();
        graphIndex = graph.index;


    }


    /**
     * Method to apply a trip update list to the most recent version of the timetable snapshot. A
     * GTFS-RT feed is always applied against a single static feed (indicated by feedId).
<<<<<<< HEAD
     * 
=======
     *
     * However, multi-feed support is not completed and we currently assume there is only one static
     * feed when matching IDs.
     *
>>>>>>> 7296be8ffd532a13afb0bec263a9f436ab787022
     * @param graph graph to update (needed for adding/changing stop patterns)
     * @param fullDataset true iff the list with updates represent all updates that are active right
     *        now, i.e. all previous updates should be disregarded
     * @param updates on Accessible Trip that should be applied atomically
     * @param feedId
     */
    public void applyTripUpdates(final Graph graph,  final List<Trip> updates, final String feedId) {
        if (updates == null) {
            LOG.warn("updates is null");
            return;
        }

        // Acquire lock on buffer
        bufferLock.lock();

        try {
            if (true /*fullDataset*/) {
                // Remove all updates from the buffer
                buffer.clear(feedId);
            }
            //raf change level 
            LOG.warn("message contains {} trip updates", updates.size());
            int uIndex = 0;
            for (Trip tripUpdate : updates) {

                ServiceDate serviceDate = new ServiceDate();
                //final AgencyAndId tripDescriptor = tripUpdate.getId();
                final AgencyAndId feedAndTripId = tripUpdate.getId();

                
                uIndex += 1;
                LOG.debug("trip update #{} ({} updates) :",
                        uIndex, updates.size());
                LOG.trace("{}", tripUpdate);

                // Determine what kind of trip update this is
                boolean applied = false;
                
                applied = handleTrip(tripUpdate);
                
  
                if (applied) {
                    appliedBlockCount++;
                } else {
                    LOG.warn("Failed to apply TripUpdate.");
                    LOG.trace(" Contents: {}", tripUpdate);
                }

                if (appliedBlockCount % logFrequency == 0) {
                    LOG.warn("Applied {} trip updates.", appliedBlockCount);
                }
            }
            LOG.debug("end of update message");

        } finally {
            // Always release lock
            bufferLock.unlock();
        }
    }

 

    private boolean handleTrip(final Trip tripUpdate) {
                
        Trip trip = graphIndex.tripForId.get(tripUpdate.getId());
        
        
        if (trip == null) {
            LOG.warn("No trip found for tripId {}, skipping TripUpdate.", tripUpdate.getId().toString());
            return false;
        }

        // Apply update on the *scheduled* trip and set the updated trip times in the buffer
   
        trip.setWheelchairAccessible(tripUpdate.getWheelchairAccessible());
        return true;
/*
        if (updatedTripTimes == null) {
            return false;
        }

        // Make sure that updated trip times have the correct real time state
        updatedTripTimes.setRealTimeState(RealTimeState.UPDATED);

        final boolean success = buffer.update(feedId, pattern, updatedTripTimes, serviceDate);
        return success;*/
    }

  


   

    private boolean purgeExpiredData() {
        final ServiceDate today = new ServiceDate();
        final ServiceDate previously = today.previous().previous(); // Just to be safe...

        if(lastPurgeDate != null && lastPurgeDate.compareTo(previously) > 0) {
            return false;
        }

        LOG.debug("purging expired realtime data");

        lastPurgeDate = previously;

        return buffer.purgeExpiredData(previously);
    }

    /**
     * Retrieve a trip pattern given a feed id and trid id.
     *
     * @param feedId feed id for the trip id
     * @param tripId trip id without agency
     * @return trip pattern or null if no trip pattern was found
     */
    private TripPattern getPatternForTripId(String feedId, String tripId) {
        Trip trip = graphIndex.tripForId.get(new AgencyAndId(feedId, tripId));
        TripPattern pattern = graphIndex.patternForTrip.get(trip);
        return pattern;
    }

    /**
     * Retrieve route given a route id without an agency
     *
     * @param feedId feed id for the route id
     * @param routeId route id without the agency
     * @return route or null if route can't be found in graph index
     */
    private Route getRouteForRouteId(String feedId, String routeId) {
        Route route = graphIndex.routeForId.get(new AgencyAndId(feedId, routeId));
        return route;
    }

    /**
     * Retrieve trip given a trip id without an agency
     *
     * @param feedId feed id for the trip id
     * @param tripId trip id without the agency
     * @return trip or null if trip can't be found in graph index
     */
    private Trip getTripForTripId(String feedId, String tripId) {
        Trip trip = graphIndex.tripForId.get(new AgencyAndId(feedId, tripId));
        return trip;
    }

    /**
     * Retrieve stop given a feed id and stop id.
     *
     * @param feedId feed id for the stop id
     * @param stopId trip id without the agency
     * @return stop or null if stop doesn't exist
     */
    private Stop getStopForStopId(String feedId, String stopId) {
        Stop stop = graphIndex.stopForId.get(new AgencyAndId(feedId, stopId));
        return stop;
    }

}
