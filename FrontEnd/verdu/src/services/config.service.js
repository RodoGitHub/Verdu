const API_BASE_URL = 'http://127.0.0.1:8000/api/';

const getBaseUrl = () => API_BASE_URL;

const getWebSocketUrl = (path) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Handle URL parsing
    try {
        const url = new URL(API_BASE_URL);
        url.protocol = protocol;
        // url.origin gives protocol + host + port
        // path should be relative to root or whatever needed.
        // Current logic in api.js was `${url.origin}/${path}`
        return `${url.origin}/${path}`;
    } catch (e) {
        console.error("Invalid API URL logic", e);
        return `ws://${window.location.host}/${path}`;
    }
};

export default {
    getBaseUrl,
    getWebSocketUrl
};
