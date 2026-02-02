// API Environment Configuration
// Change EXPO_PUBLIC_API_ENV in .env to switch between environments
const API_ENV = process.env.EXPO_PUBLIC_API_ENV || 'production';

const API_URLS = {
  development: process.env.EXPO_PUBLIC_API_URL_DEV || 'http://10.0.2.2:3001', // Android emulator localhost
  production: process.env.EXPO_PUBLIC_API_URL_PROD || 'https://cuidarecife-api.onrender.com',
};

const API_BASE_URL = API_URLS[API_ENV as keyof typeof API_URLS] || API_URLS.production;

console.log(`[API] Environment: ${API_ENV}, URL: ${API_BASE_URL}`);

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

class ApiService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<boolean> | null = null;

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
  }

  getAccessToken() {
    return this.accessToken;
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });

        if (response.ok) {
          const data = await response.json();
          this.accessToken = data.accessToken;
          this.refreshToken = data.refreshToken;
          return true;
        }
        return false;
      } catch {
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      let response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      // If 401 and we have a refresh token, try to refresh
      if (response.status === 401 && this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry the original request with new token
          (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
          response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
          });
        }
      }

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Request failed' };
      }

      return { data };
    } catch (error) {
      return { error: 'Network error. Please check your connection.' };
    }
  }

  // Auth methods
  async register(name: string, email: string, password: string, neighborhood?: string): Promise<ApiResponse<{ message: string; userId: string }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, neighborhood }),
    });
  }

  async login(email: string, password: string): Promise<ApiResponse<AuthTokens>> {
    const response = await this.request<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data) {
      this.setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  }

  async logout(): Promise<void> {
    if (this.refreshToken) {
      await this.request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
    }
    this.clearTokens();
  }

  // Protected API methods
  async sendChatMessage(
    message: string,
    history?: Array<{ role: 'user' | 'model'; content: string }>
  ): Promise<ApiResponse<{ reply: string }>> {
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    });
  }

  async analyzeImage(base64Image: string): Promise<ApiResponse<{ extractedText: string }>> {
    return this.request('/vision/analyze-image', {
      method: 'POST',
      body: JSON.stringify({ image: base64Image }),
    });
  }

  async verifyPrescription(prescriptionData: any): Promise<ApiResponse<{ analysisResult: string }>> {
    return this.request('/prescription/verify', {
      method: 'POST',
      body: JSON.stringify(prescriptionData),
    });
  }

  // ===== HEALTH TRACKING METHODS =====

  // Glucose
  async saveGlucoseReading(data: {
    value: number;
    measuredAt: string;
    mealContext?: 'before' | 'after' | null;
  }): Promise<ApiResponse<{ message: string; reading: any }>> {
    return this.request('/health/glucose', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getGlucoseHistory(limit: number = 10): Promise<ApiResponse<{ readings: any[] }>> {
    return this.request(`/health/glucose?limit=${limit}`);
  }

  // Blood Pressure
  async savePressureReading(data: {
    systolic: number;
    diastolic: number;
    measuredAt: string;
  }): Promise<ApiResponse<{ message: string; reading: any }>> {
    return this.request('/health/pressure', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPressureHistory(limit: number = 10): Promise<ApiResponse<{ readings: any[] }>> {
    return this.request(`/health/pressure?limit=${limit}`);
  }

  // Prescription
  async savePrescription(data: {
    patientName?: string;
    returnInDays?: number;
    medications: Array<{
      name: string;
      dosage?: string;
      instructions: string;
      timesPerDay?: number;
      times?: string[];
      isFree?: boolean;
    }>;
  }): Promise<ApiResponse<{ message: string; prescription: any }>> {
    return this.request('/health/prescription', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPrescription(): Promise<ApiResponse<{ prescription: any | null }>> {
    return this.request('/health/prescription');
  }

  // ===== MEDICATION TRACKING =====

  // Extrai medicamentos de imagem via OCR
  async extractMedicationsFromImage(base64Image: string): Promise<ApiResponse<{
    medications: Array<{
      name: string;
      dosage?: string;
      instructions: string;
      timesPerDay?: number;
      times?: string[];
      isFree?: boolean;
    }>;
    extractedText: string;
  }>> {
    return this.request('/medications/extract-from-image', {
      method: 'POST',
      body: JSON.stringify({ image: base64Image }),
    });
  }

  // Busca medicamentos do dia com status de doses
  async getTodayMedications(): Promise<ApiResponse<{
    medications: Array<{
      id: string;
      name: string;
      dosage?: string;
      instructions: string;
      timesPerDay: number;
      times: string[];
      isFree: boolean;
      dosesTakenToday: number;
      dosesRequired: number;
      isComplete: boolean;
      doseLogs: Array<{
        id: string;
        scheduledTime?: string;
        takenAt: string;
      }>;
    }>;
  }>> {
    return this.request('/medications/today');
  }

  // Registra dose tomada
  async recordDose(medicationId: string, data?: {
    scheduledTime?: string;
    takenAt?: string;
  }): Promise<ApiResponse<{ message: string; doseLog: any }>> {
    return this.request(`/medications/${medicationId}/dose`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  // Remove registro de dose
  async deleteDose(medicationId: string, doseId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/medications/${medicationId}/dose/${doseId}`, {
      method: 'DELETE',
    });
  }

  // Marca dose como esquecida
  async markForgotten(medicationId: string, data?: {
    scheduledTime?: string;
  }): Promise<ApiResponse<{ message: string; doseLog: any }>> {
    return this.request(`/medications/${medicationId}/forgotten`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  // Busca farmácias populares ordenadas por proximidade
  async getPharmacies(location?: { lat: number; lng: number }): Promise<ApiResponse<{
    count: number;
    hasUserLocation: boolean;
    data: Array<{
      id: string;
      name: string;
      address: string;
      neighborhood: string;
      cep: string | null;
      phone: string | null;
      latitude: number | null;
      longitude: number | null;
      distance: number | null; // distância em km
      fullAddress: string;
    }>;
  }>> {
    const query = location ? `?lat=${location.lat}&lng=${location.lng}` : '';
    return this.request(`/pharmacies${query}`);
  }
}

export const api = new ApiService();
export type { AuthTokens, ApiResponse };


