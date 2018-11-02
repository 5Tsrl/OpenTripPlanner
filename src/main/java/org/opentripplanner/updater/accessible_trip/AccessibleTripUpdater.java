package org.opentripplanner.updater.accessible_trip;

import java.util.List;
import java.util.concurrent.ExecutionException;

import org.opentripplanner.model.Trip;
import org.opentripplanner.routing.graph.Graph;
import org.opentripplanner.updater.GraphUpdaterManager;
import org.opentripplanner.updater.GraphWriterRunnable;
import org.opentripplanner.updater.JsonConfigurable;
import org.opentripplanner.updater.PollingGraphUpdater;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * Dynamic accessibility info updater which encapsulate one AcceesibleTripDataSource.
 *
 * Usage example () in the file router-config.json
	type: "accessible-trip-updater",
    frequencySec: 20,
    sourceType: "trip-http",
    url: "http://mat.5t.torino.it/accessible-trips.json",
    feedId: "1"
 *
 */
public class AccessibleTripUpdater extends PollingGraphUpdater {

    private static final Logger LOG = LoggerFactory.getLogger(AccessibleTripUpdater.class);

    private GraphUpdaterManager updaterManager;

    private AccessibleTripDataSource source;

    /**
     * Property to set on the RealtimeDataSnapshotSource
     */
    private Integer logFrequency;

    /**
     * Property to set on the RealtimeDataSnapshotSource
     */
    private Integer maxSnapshotFrequency;

    /**
     * Property to set on the RealtimeDataSnapshotSource
     */
    private Boolean purgeExpiredData;

    /**
     * Feed id that is used for the trip ids in the TripUpdates
     */
    private String feedId;

    @Override
    public void setGraphUpdaterManager(GraphUpdaterManager updaterManager) {
        this.updaterManager = updaterManager;
    }

    @Override
    public void configurePolling (Graph graph, JsonNode config) throws Exception {
    	// Create update streamer from preferences
    	feedId = config.path("feedId").asText("");
        AccessibleTripDataSource source = new GTTAccessibleTripDataSource();
        if (source instanceof JsonConfigurable) {
            ((JsonConfigurable) source).configure(graph, config);
        }

        // Configure updater
        LOG.info("Setting up accessible trip updater.");
        this.source = source;
        LOG.info("Creating accessible trip updater running every {} seconds : {}", pollingPeriodSeconds, source);
    }

    @Override
    public void setup(Graph graph) throws InterruptedException, ExecutionException {
      // Create a realtime data snapshot source and wait for runnable to be executed
      updaterManager.execute(new GraphWriterRunnable() {
            @Override
            public void run(Graph graph) {
              // Only create a realtime data snapshot source if none exists already
              AccessibleTripSnapshotSource snapshotSource = graph.accessibleTripSnapshotSource;
              if (snapshotSource == null) {
                snapshotSource = new AccessibleTripSnapshotSource(graph);
                // Add snapshot source to graph
                graph.accessibleTripSnapshotSource = (snapshotSource);
              }
              // Set properties of realtime data snapshot source
              if (logFrequency != null) {
                snapshotSource.logFrequency = (logFrequency);
              }
              if (maxSnapshotFrequency != null) {
                snapshotSource.maxSnapshotFrequency = (maxSnapshotFrequency);
              }
              if (purgeExpiredData != null) {
                snapshotSource.purgeExpiredData = (purgeExpiredData);
              }
            }
      });
    }

    /**
     * Repeatedly makes blocking calls to an UpdateStreamer to retrieve new stop time updates, and
     * applies those updates to the graph.
     */
    @Override
    public void runPolling() {
    	LOG.debug("runPolling on AccessibleTripUpdater...");
        // Get update lists from update source
        List<Trip> updates = source.getTrips();
        if (updates != null) {
            // Handle trip updates via graph writer runnable
            AccessibleTripGraphWriterRunnable runnable =
                    new AccessibleTripGraphWriterRunnable(updates, feedId);
            updaterManager.execute(runnable);
        }
    }

    @Override
    public void teardown() {
    }

    public String toString() {
        String s = (source == null) ? "NONE" : source.toString();
        return "Streaming accessible trip updater with update source = " + s;
    }

}
