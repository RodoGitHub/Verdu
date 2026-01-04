import api from './api';

const RESOURCE = 'balanza/terminals/';

const getAll = () => api.get(RESOURCE);
const create = (data) => api.post(RESOURCE, data);
const update = (id, data) => api.put(`${RESOURCE}${id}/`, data);
const remove = (id) => api.delete(`${RESOURCE}${id}/`);

export default {
    getAll,
    create,
    update,
    remove
};
