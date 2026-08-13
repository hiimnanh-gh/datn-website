import operationZoneService from './operationZoneService';

export const edgeNodeService = {
  getAll: operationZoneService.getAll,
  getById: operationZoneService.getById,
  create: operationZoneService.create,
  update: operationZoneService.update,
  delete: operationZoneService.delete
};

export default edgeNodeService;
