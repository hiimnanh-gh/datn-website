import { Client } from '@stomp/stompjs';
import useAuthStore from '../store/useAuthStore';

class WebSocketService {
  constructor() {
    this.client = new Client({
      brokerURL: import.meta.env.VITE_WS_ENDPOINT || 'ws://localhost:8080/ws',
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });
  }

  connect(onConnect, onError) {
    const token = useAuthStore.getState().token;
    
    this.client.connectHeaders = {
      Authorization: `Bearer ${token}`
    };

    this.client.onConnect = onConnect;
    this.client.onStompError = onError;

    this.client.activate();
  }

  disconnect() {
    this.client.deactivate();
  }

  subscribe(topic, callback) {
    return this.client.subscribe(topic, callback);
  }
}

const wsService = new WebSocketService();
export default wsService;
