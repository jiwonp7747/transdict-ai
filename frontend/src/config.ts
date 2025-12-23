// config.ts
const rawUrl = (window as any)._env_?.REACT_APP_API_URL || process.env.REACT_APP_API_URL || "http://localhost:8000";

const formattedUrl = rawUrl.startsWith('http') ? rawUrl : `http://${rawUrl}`;

const config = {
    apiUrl: formattedUrl,
};

export default config;