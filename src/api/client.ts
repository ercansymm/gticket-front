import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json; charset=utf-8',
    'Accept-Charset': 'utf-8',
  },
  responseType: 'json',
});

// Request interceptor — sadeleştirildi (session bilgisi body'de gönderiliyor)
apiClient.interceptors.request.use(
  (config) => {
    // Transaction ID ekle (kendi takibimiz için)
    config.headers['X-Transaction-Id'] = crypto.randomUUID();
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — hasError kontrolü ekle
apiClient.interceptors.response.use(
  (response) => {
    // API 200 dönse bile hasError: true olabilir
    if (response.data?.hasError) {
      return Promise.reject({
        response: {
          status: 200,
          data: response.data
        },
        message: response.data.errorMessage || 'API hatası'
      });
    }
    return response;
  },
  (error) => {
    // Intentionally not logging PII — only error type
    if (process.env.NODE_ENV === 'development') {
      if (error.code === 'ECONNABORTED') {
        console.error('API Timeout:', error.config?.url);
      }
      if (!error.response) {
        console.error('Network Error:', error.message);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
