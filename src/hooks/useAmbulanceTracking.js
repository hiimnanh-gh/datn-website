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

    // Update single simulation tracking if matching simulationId or missionId
    const matchesSim = simulationId && (data.simulationId === simulationId || String(data.simulationId) === String(simulationId));
    const matchesMission = missionId && (data.missionId === missionId || String(data.missionId) === String(missionId));
    if (matchesSim || matchesMission) {
      setSingleTracking(trackingItem);
    }
  }, [simulationId, missionId]);

  // Fetch initial REST snapshot
  const fetchSnapshot = useCallback(async () => {
    try {
      if (simulationId) {
        const res = await ambulanceSimulationService.getTracking(simulationId);
        if (res) {
          handleTrackingMessage(res);
          return res;
        }
      } else if (missionId) {
        const res = await ambulanceSimulationService.getTrackingByMission(missionId);
        if (res) {
          handleTrackingMessage(res);
          return res;
        }
      }
    } catch {
      // REST tracking fetch optional when WS is active
    }
    return null;
  }, [simulationId, missionId, handleTrackingMessage]);

  useEffect(() => {
    let isSubscribed = true;

    // Fetch initial REST snapshot
    const initSnapshot = async () => {
      try {
        let res = null;
        if (simulationId) {
          res = await ambulanceSimulationService.getTracking(simulationId);
        } else if (missionId) {
          res = await ambulanceSimulationService.getTrackingByMission(missionId);
        }
        if (isSubscribed && res) {
          handleTrackingMessage(res);
        }
      } catch {
        // Ignore initial fetch error when WS handles updates
      }
    };

    void initSnapshot();

    // Connect & subscribe via WebSocket Service
    wsService.connect(
      () => {
        if (!isSubscribed) return;
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
      () => {
        if (isSubscribed) {
          setIsConnected(false);
        }
      }
    );

    return () => {
      isSubscribed = false;
      if (subRef.current && typeof subRef.current.unsubscribe === 'function') {
        subRef.current.unsubscribe();
      }
    };
  }, [simulationId, missionId, isDispatcher, handleTrackingMessage, fetchSnapshot]);

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
