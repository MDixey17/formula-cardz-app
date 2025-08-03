import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthRequest,
  AuthResponse,
  NewUserRequest,
  UpdateUserRequest,
  CardCollectionResponse,
  CardDropResponse,
  OneOfOneCardResponse,
  AddCardToCollectionRequest,
  UpdateCardInCollectionRequest,
  RemoveCardFromCollectionRequest, Dropdown, CardResponse, ForgotPasswordRequest, UpdatedUserResponse
} from '@/types/api';

const API_BASE_URL = "https://formula-cardz-api.onrender.com";
const TOKEN_KEY = 'formula_cardz_token';

class ApiService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Authentication
  async login(credentials: AuthRequest, expireOverride?: string): Promise<AuthResponse> {
    return this.request<AuthResponse>(expireOverride !== undefined ? `/v1/auth/login?expireOverride=${expireOverride}` : '/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: NewUserRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async forgotPassword(userData: ForgotPasswordRequest) {
    return this.request('/v1/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }

  async updateUser(userId: string, userData: UpdateUserRequest): Promise<UpdatedUserResponse> {
    return this.request<UpdatedUserResponse>(`/v1/user/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Collection Management
  async getCollection(userId: string): Promise<CardCollectionResponse[]> {
    return this.request<CardCollectionResponse[]>(`/v1/ownership/${userId}`);
  }

  async addCardToCollection(request: AddCardToCollectionRequest): Promise<void> {
    return this.request<void>('/v1/ownership', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async updateCardInCollection(request: UpdateCardInCollectionRequest): Promise<void> {
    return this.request<void>('/v1/ownership', {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async removeCardFromCollection(request: RemoveCardFromCollectionRequest): Promise<void> {
    return this.request<void>('/v1/ownership', {
      method: 'DELETE',
      body: JSON.stringify(request),
    });
  }

  // 1/1 Card Tracking
  async getOneOfOneCards(setName?: string): Promise<OneOfOneCardResponse[]> {
    const params = setName ? `?setName=${encodeURIComponent(setName)}` : '';
    return this.request<OneOfOneCardResponse[]>(`/v1/oneofones${params}`);
  }

  async getCardSets(): Promise<Dropdown[]> {
    return this.request<Dropdown[]>('/v1/dropdown/sets');
  }

  // General Card Data
  async getCardsBySet(setName: string): Promise<CardResponse[]> {
    return this.request<CardResponse[]>(`/v1/cards?setName=${encodeURIComponent(setName)}`);
  }

  // Drops
  async getUpcomingDrops(): Promise<CardDropResponse[]> {
    return this.request<CardDropResponse[]>('/v1/drops');
  }
}

export const apiService = new ApiService();