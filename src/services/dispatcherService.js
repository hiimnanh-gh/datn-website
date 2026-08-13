import { dispatchRequestService } from './dispatchRequestService';
import { dispatchResourceService } from './dispatchResourceService';
import { dispatchMissionService } from './dispatchMissionService';
import { providerService } from './providerService';
import { serviceTypeService } from './serviceTypeService';
import { edgeNodeService } from './edgeNodeService';
import { operationZoneService } from './operationZoneService';
import { medicalHospitalService } from './medicalHospitalService';

export const dispatcherService = {
  getProviders: providerService.getAll,
  getProviderById: providerService.getById,
  
  getDispatchResources: dispatchResourceService.getAll,
  getDispatchResourceById: dispatchResourceService.getById,
  updateResourceStatus: dispatchResourceService.updateStatus,

  getDispatchRequests: dispatchRequestService.getAll,
  getDispatchRequestById: dispatchRequestService.getById,
  verifyDispatchRequest: dispatchRequestService.verify,
  rejectDispatchRequest: dispatchRequestService.reject,
  redispatchRequest: dispatchRequestService.redispatch,
  confirmDispatchRequest: dispatchRequestService.confirm,
  analyzeDispatchRequest: dispatchRequestService.analyze,
  updateRequestSeverity: dispatchRequestService.updateSeverity,
  getRequestTimeline: dispatchRequestService.getTimeline,
  getRecommendations: dispatchRequestService.getRecommendations,
  getRequestStatistics: dispatchRequestService.getStatistics,

  getServiceTypes: serviceTypeService.getAll,
  getServiceTypeById: serviceTypeService.getById,

  getEdgeNodes: edgeNodeService.getAll,
  getEdgeNodeById: edgeNodeService.getById,
  getOperationZones: operationZoneService.getAll,

  getHospitals: medicalHospitalService.getAll,

  getDispatchMissions: dispatchMissionService.getAll,
  createDispatchMission: dispatchMissionService.create,
  redispatchMission: dispatchMissionService.redispatch,
  getDispatchMissionById: dispatchMissionService.getById,
};

export default dispatcherService;
