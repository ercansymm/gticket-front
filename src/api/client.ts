import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 65000,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json; charset=utf-8',
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

// Response interceptor — hasError kontrolü + hata formatı standardizasyonu
apiClient.interceptors.response.use(
  (response) => {
    // API 200 dönse bile hasError: true olabilir (BiletBank hata formatı)
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
    // Hata response'undan kullanıcı-dostu mesaj çıkar
    // Backend 4 farklı format kullanıyor:
    // 1. { error: "string" }             — 400 validation
    // 2. { error: "string", inner: "..." } — 500 server
    // 3. { hasError: true, errorMessage: "..." } — 200 BiletBank (yukarıda yakalanır)
    // 4. { success: false, error: { code: "RATE_LIMIT_EXCEEDED", message: "..." } } — 429
    if (error.response?.data) {
      const data = error.response.data;
      let msg: string | undefined;

      if (typeof data.error === 'string') {
        msg = data.error;
      } else if (typeof data.error === 'object' && data.error?.message) {
        msg = data.error.message;
      } else if (data.errorMessage) {
        msg = data.errorMessage;
      }

      if (msg) {
        error.userMessage = msg;
      }
    }

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
