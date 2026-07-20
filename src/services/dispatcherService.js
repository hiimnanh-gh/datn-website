import api from './api';
import { dispatchRequestService } from './dispatchRequestService';
import { dispatchResourceService } from './dispatchResourceService';
import { dispatchMissionService } from './dispatchMissionService';
import { providerService } from './providerService';
import { serviceTypeService } from './serviceTypeService';
import { edgeNodeService } from './edgeNodeService';

export const dispatcherService = {
  getProviders: providerService.getAll,
  getProviderById: providerService.getById,
  
  getDispatchResources: dispatchResourceService.getAll,
  getDispatchResourceById: dispatchResourceService.getById,
  updateResourceStatus: dispatchResourceService.updateStatus,

  getDispatchRequests: dispatchRequestService.getAll,
  getDispatchRequestById: dispatchRequestService.getById,

  getServiceTypes: serviceTypeService.getAll,
  getServiceTypeById: serviceTypeService.getById,

  getEdgeNodes: edgeNodeService.getAll,
  getEdgeNodeById: edgeNodeService.getById,

  createDispatchMission: dispatchMissionService.create,
};

export default dispatcherService;
