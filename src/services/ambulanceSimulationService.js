import api from './api';
import { unwrapBaseResponse } from './dispatchRequestService';

export const ambulanceSimulationService = {
  /**
   * Tạo phiên mô phỏng OSRM
   * POST /api/v1/ambulance-simulations
   * @param {Object} payload { missionId, hospitalId, tickIntervalMs, speedMultiplier, sceneWaitSeconds }
   */
  create: async (payload) => {
    const response = await api.post('/v1/ambulance-simulations', payload);
    return unwrapBaseResponse(response);
  },

  /**
   * Bắt đầu mô phỏng
   * POST /api/v1/ambulance-simulations/{id}/start
   * @param {number|string} id Simulation ID
   */
  start: async (id) => {
    const response = await api.post(`/v1/ambulance-simulations/${id}/start`);
    return unwrapBaseResponse(response);
  },

  /**
   * Dừng tạm thời mô phỏng
   * POST /api/v1/ambulance-simulations/{id}/stop
   * @param {number|string} id Simulation ID
   */
  stop: async (id) => {
    const response = await api.post(`/v1/ambulance-simulations/${id}/stop`);
    return unwrapBaseResponse(response);
  },

  /**
   * Tiếp tục chặng di chuyển về bệnh viện sau khi tại hiện trường
   * POST /api/v1/ambulance-simulations/{id}/continue
   * @param {number|string} id Simulation ID
   */
  continue: async (id) => {
    const response = await api.post(`/v1/ambulance-simulations/${id}/continue`);
    return unwrapBaseResponse(response);
  },

  /**
   * Lấy chi tiết thông tin phiên mô phỏng
   * GET /api/v1/ambulance-simulations/{id}
   * @param {number|string} id Simulation ID
   */
  getById: async (id) => {
    const response = await api.get(`/v1/ambulance-simulations/${id}`);
    return unwrapBaseResponse(response);
  },

  /**
   * Lấy vị trí & thông số tracking tức thời theo Simulation ID (dành cho Dispatcher/Admin)
   * GET /api/v1/ambulance-simulations/{id}/tracking
   * @param {number|string} id Simulation ID
   */
  getTracking: async (id) => {
    const response = await api.get(`/v1/ambulance-simulations/${id}/tracking`);
    return unwrapBaseResponse(response);
  },

  /**
   * Lấy vị trí & thông số tracking tức thời theo Mission ID (dành cho Reporter/Driver)
   * GET /api/v1/ambulance-simulations/by-mission/{missionId}/tracking
   * @param {number|string} missionId Mission ID
   */
  getTrackingByMission: async (missionId) => {
    const response = await api.get(`/v1/ambulance-simulations/by-mission/${missionId}/tracking`);
    return unwrapBaseResponse(response);
  }
};

export default ambulanceSimulationService;
