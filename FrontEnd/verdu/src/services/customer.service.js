import api from './api';

const getAll = () => api.get('customers/customers/');
const get = (id) => api.get(`customers/customers/${id}/`);
const create = (data) => api.post('customers/customers/', data);
const update = (id, data) => api.put(`customers/customers/${id}/`, data);
const remove = (id) => api.delete(`customers/customers/${id}/`);

export default {
    getAll,
    get,
    create,
    update,
    remove
}
