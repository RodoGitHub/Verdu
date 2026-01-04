import api from './api';

const getAll = () => api.get('payments/methods/');
const create = (data) => api.post('payments/methods/', data);
const update = (id, data) => api.put(`payments/methods/${id}/`, data);
const remove = (id) => api.delete(`payments/methods/${id}/`);

export default {
    getAll,
    create,
    update,
    remove
};
