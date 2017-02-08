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

import java.util.List;
import java.util.concurrent.locks.ReentrantLock;

import org.onebusaway.gtfs.model.Trip;
import org.onebusaway.gtfs.model.calendar.ServiceDate;
import org.opentripplanner.routing.edgetype.TimetableSnapshot;
import org.opentripplanner.routing.graph.Graph;
import org.opentripplanner.routing.graph.GraphIndex;
import org.opentripplanner.updater.GtfsRealtimeFuzzyTripMatcher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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

    public int logFrequency = 2000;

    private int appliedBlockCount = 0;

    /**
     * If a timetable snapshot is requested less than this number of milliseconds after the previous
     * snapshot, just return the same one. Throttles the potentially resource-consuming task of
     * duplicating a TripPattern -> Timetable map and indexing the new Timetables.
     */
    public int maxSnapshotFrequency = 1000; // msec

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

    private final GraphIndex graphIndex;

    public GtfsRealtimeFuzzyTripMatcher fuzzyTripMatcher;

    public AccessibleTripSnapshotSource(final Graph graph) {
        graph.getTimeZone();
        graphIndex = graph.index;


    }


    /**
     * Method to apply a accessible trip update list to the most recent version of the timetable snapshot. 
     * accessible trip updates are applied against a single static feed (indicated by feedId).
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
            buffer.clear(feedId);
            LOG.info("message contains {} accessible trips", updates.size());
            int uIndex = 0;
            for (Trip tripUpdate : updates) {

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
        trip.setWheelchairAccessible(tripUpdate.getWheelchairAccessible());
        return true;
    }

}
