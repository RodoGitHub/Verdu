import api from './api';

const getAll = (params = {}) => {
    // params can include date, etc.
    // e.g. api.get('sales/sales/', { params: { date: '2023-10-27' } })
    return api.get('sales/sales/', { params });
};

const get = (id) => api.get(`sales/sales/${id}/`);
const create = (data) => api.post('sales/sales/', data);
const update = (id, data) => api.patch(`sales/sales/${id}/`, data);

export default {
    getAll,
    get,
    create,
    update
};
