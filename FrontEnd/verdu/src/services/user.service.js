import api from './api';

// Note: Endpoint is 'users/users/' because router registers 'users' and included in 'api/users/' 
// Wait, router.register(r'users', UserViewSet) in home/urls.py means 'users/' relative to include path.
// Include path is 'api/users/'.
// So URL is 'api/users/users/'. It sounds repetitive but that is typical Django Router nesting logic check.
// Using 'users/users/' is a safe bet based on configuration pattern, but let's be careful.
// Actually home/urls.py says router.register(r'users', ...). URL is ^api/users/users/$
// Let's verify by checking home/urls.py content again or guessing safely.
// Most likely it is 'users/users/'.
// Update: I'll use 'users/users/' and if it fails I'll advise user or fix it.
// Wait, looking at products/urls.py: router.register(r'items', ...) -> 'api/products/items/'
// customers/urls.py likely has router.register(r'items'...) -> 'api/customers/items/'
// home/urls.py has router.register(r'users', ...) -> 'api/users/users/'
// Yes.

const getAll = () => api.get('users/users/');
const get = (id) => api.get(`users/users/${id}/`);
const create = (data) => api.post('users/users/', data);
const update = (id, data) => api.put(`users/users/${id}/`, data);
const remove = (id) => api.delete(`users/users/${id}/`);

const getPublicSellers = () => api.get('users/users/public_sellers/');
const checkHealth = () => api.get('users/health/');

export default {
    getAll,
    get,
    create,
    update,
    remove,
    getPublicSellers,
    checkHealth
}
