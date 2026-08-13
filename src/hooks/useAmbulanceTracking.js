import { useState, useEffect, useRef, useCallback } from 'react';
import wsService from '../services/websocket';
import ambulanceSimulationService from '../services/ambulanceSimulationService';

/**
 * Custom hook to track real-time ambulance OSRM simulations via STOMP WebSocket & REST fallback.
 * 
 * @param {number|string|null} simulationId Optional specific simulation ID to subscribe to.
 * @param {Object} options Configuration options { isDispatcher: boolean, missionId: number|string }
 */
export function useAmbulanceTracking(simulationId = null, options = {}) {
  const { isDispatcher = true, missionId = null } = options;

  // Map of all tracked ambulances: { [simulationId/resourceId]: trackingData }
  const [ambulancesMap, setAmbulancesMap] = useState({});
  // Single tracking data when simulationId is specified
  const [singleTracking, setSingleTracking] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);

  const subRef = useRef(null);

  // Helper to handle incoming position update or event
  const handleTrackingMessage = useCallback((data) => {
    if (!data) return;

    setLastEvent(data);

    // Extract position normalized format
    const lat = data.position?.latitude ?? data.currentLatitude;
    const lng = data.position?.longitude ?? data.currentLongitude;

    const trackingItem = {
      simulationId: data.simulationId,
      missionId: data.missionId,
      resourceId: data.resourceId,
      status: data.status,
      phase: data.phase,
      eventType: data.eventType,
      sourceType: data.sourceType || 'SIMULATION',
      latitude: lat,
      longitude: lng,
      position: { latitude: lat, longitude: lng },
      progressPercent: data.progressPercent ?? 0,
      remainingDistanceMeters: data.remainingDistanceMeters ?? 0,
      etaSeconds: data.etaSeconds ?? 0,
      sequence: data.sequence,
      occurredAt: data.occurredAt || new Date().toISOString()
    };

    // Update map of all active ambulances
    const key = data.simulationId || data.resourceId;
    if (key) {
      setAmbulancesMap(prev => ({
        ...prev,
        [key]: trackingItem
      }));
    }

    // Update single simulation tracking if matching simulationId
    if (simulationId && (data.simulationId === simulationId || String(data.simulationId) === String(simulationId))) {
      setSingleTracking(trackingItem);
    }
  }, [simulationId]);

  // Fetch initial REST snapshot
  const fetchSnapshot = useCallback(async () => {
    try {
      if (simulationId) {
        const res = await ambulanceSimulationService.getTracking(simulationId);
        if (res) handleTrackingMessage(res);
      } else if (missionId) {
        const res = await ambulanceSimulationService.getTrackingByMission(missionId);
        if (res) handleTrackingMessage(res);
      }
    } catch (err) {
      // REST tracking fetch optional when WS is active
    }
  }, [simulationId, missionId, handleTrackingMessage]);

  useEffect(() => {
    fetchSnapshot();

    // Connect & subscribe via WebSocket Service
    wsService.connect(
      () => {
        setIsConnected(true);

        // 1. If Dispatcher or broad tracking mode, subscribe to dispatcher topic
        if (isDispatcher) {
          subRef.current = wsService.subscribe('/topic/dispatcher/ambulances', (msg) => {
            try {
              const body = JSON.parse(msg.body);
              handleTrackingMessage(body);
            } catch (e) {
              console.error('Error parsing WS message from /topic/dispatcher/ambulances:', e);
            }
          });
        }

        // 2. If specific simulationId given, also subscribe to simulation topic
        if (simulationId) {
          const simSub = wsService.subscribe(`/topic/simulations/${simulationId}`, (msg) => {
            try {
              const body = JSON.parse(msg.body);
              handleTrackingMessage(body);
            } catch (e) {
              console.error(`Error parsing WS message for simulation ${simulationId}:`, e);
            }
          });

          return () => {
            if (simSub && typeof simSub.unsubscribe === 'function') {
              simSub.unsubscribe();
            }
          };
        }
      },
      (err) => {
        setIsConnected(false);
      }
    );

    return () => {
      if (subRef.current && typeof subRef.current.unsubscribe === 'function') {
        subRef.current.unsubscribe();
      }
    };
  }, [simulationId, isDispatcher, handleTrackingMessage, fetchSnapshot]);

  return {
    ambulancesMap,
    singleTracking,
    position: singleTracking ? singleTracking.position : null,
    phase: singleTracking ? singleTracking.phase : null,
    progress: singleTracking ? singleTracking.progressPercent : 0,
    etaSeconds: singleTracking ? singleTracking.etaSeconds : 0,
    remainingDistanceMeters: singleTracking ? singleTracking.remainingDistanceMeters : 0,
    status: singleTracking ? singleTracking.status : null,
    isConnected,
    lastEvent,
    refreshSnapshot: fetchSnapshot
  };
}

export default useAmbulanceTracking;
