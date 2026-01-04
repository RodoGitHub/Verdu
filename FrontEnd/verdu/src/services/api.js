import axios from 'axios';
import ConfigService from './config.service';

const api = axios.create({
    baseURL: ConfigService.getBaseUrl(),
});

// Interceptor para agregar Token a cada petición
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores (ej: Token vencido)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Si el error es 401 (No autorizado) y no hemos reintentado aún...
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                    // Intentar refrescar token
                    const { data } = await axios.post(`${ConfigService.getBaseUrl()}token/refresh/`, {
                        refresh: refreshToken
                    });

                    // Guardar nuevo token
                    localStorage.setItem('access_token', data.access);

                    // Reintentar la petición original con el nuevo token
                    originalRequest.headers['Authorization'] = `Bearer ${data.access}`;
                    return api(originalRequest);
                } else {
                    // No hay refresh token, forzar logout
                    throw new Error("No refresh token available");
                }
            } catch (refreshError) {
                // Si falla el refresh o no hay token, logout forzado
                console.error("Session expired", refreshError);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
