import api from './api';

const getAll = (params) => api.get('products/items/', { params });
const get = (id) => api.get(`products/items/${id}/`);
const create = (data) => api.post('products/items/', data);
const update = (id, data) => api.patch(`products/items/${id}/`, data);
const remove = (id) => api.delete(`products/items/${id}/`);

const getCategories = () => api.get('products/categories/');
const createCategory = (data) => api.post('products/categories/', data);
const updateCategory = (id, data) => api.put(`products/categories/${id}/`, data);
const removeCategory = (id) => api.delete(`products/categories/${id}/`);

export default {
    getAll,
    get,
    create,
    update,
    remove,

    getCategories,
    createCategory,
    updateCategory,
    removeCategory
}
