import { Client } from '@stomp/stompjs';
import useAuthStore from '../store/useAuthStore';

class WebSocketService {
  constructor() {
    this.client = new Client({
      reconnectDelay: 0, // Set to 0 to prevent infinite retry loops when WS backend is unauthenticated
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });
  }

  connect(onConnect, onError) {
    const token = useAuthStore.getState().token;
    
    if (!token) {
      if (onError) onError(new Error('No JWT Token'));
      return;
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const baseUrl = import.meta.env.VITE_WS_ENDPOINT || `${wsProtocol}//${window.location.hostname}:8080/ws`;
    
    const formattedUrl = baseUrl.includes('?') 
      ? `${baseUrl}&token=${encodeURIComponent(token)}` 
      : `${baseUrl}?token=${encodeURIComponent(token)}`;

    this.client.brokerURL = formattedUrl;
    this.client.connectHeaders = {
      Authorization: `Bearer ${token}`
    };

    this.client.onConnect = (frame) => {
      console.log('WebSocket STOMP connected successfully');
      if (onConnect) onConnect(frame);
    };

    this.client.onStompError = (frame) => {
      this.client.reconnectDelay = 0;
      if (onError) onError(frame);
    };

    this.client.onWebSocketError = (event) => {
      this.client.reconnectDelay = 0;
      if (onError) onError(event);
    };

    try {
      this.client.activate();
    } catch (err) {
      if (onError) onError(err);
    }
  }

  disconnect() {
    if (this.client) {
      try {
        this.client.deactivate();
      } catch (err) {
        // silent
      }
    }
  }

  subscribe(topic, callback) {
    if (!this.client || !this.client.connected) {
      return { unsubscribe: () => {} };
    }
    return this.client.subscribe(topic, callback);
  }
}

const wsService = new WebSocketService();
export default wsService;
