package org.opentripplanner.updater.accessible_trip;

import java.util.List;

import org.onebusaway.gtfs.model.Trip;
import org.opentripplanner.routing.graph.Graph;
import org.opentripplanner.updater.GraphWriterRunnable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.base.Preconditions;

public class AccessibleTripGraphWriterRunnable implements GraphWriterRunnable {
    private static Logger LOG = LoggerFactory.getLogger(AccessibleTripGraphWriterRunnable.class);


    /**
     * The list with updates to apply to the graph
     */
    private final List<Trip> updates;

    private final String feedId;

    public AccessibleTripGraphWriterRunnable( final List<Trip> updates, final String feedId) {
        // Preconditions
        Preconditions.checkNotNull(updates);
        Preconditions.checkNotNull(feedId);

        // Set fields
        this.updates = updates;
        this.feedId = feedId;
    }

    @Override
    public void run(Graph graph) {
        // Apply updates to graph using realtime snapshot source
        AccessibleTripSnapshotSource snapshotSource = graph.accessibleTripSnapshotSource;
        if (snapshotSource != null) {
            snapshotSource.applyTripUpdates(graph, updates, feedId);
        } else {
            LOG.error("Could not find realtime data snapshot source in graph."
                    + " The following updates are not applied: {}", updates);
        }
    }
}
