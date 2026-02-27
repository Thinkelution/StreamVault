import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sv_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sv_token');
      localStorage.removeItem('sv_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;

// ── Auth ──
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/login', { email, password }),
  me: () => api.get<User>('/auth/me'),
};

// ── Videos ──
export const videosApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Video>>('/videos', { params }),
  get: (id: string) => api.get<Video>(`/videos/${id}`),
  create: (data: Partial<Video>) => api.post<Video>('/videos', data),
  update: (id: string, data: Partial<Video>) =>
    api.patch<Video>(`/videos/${id}`, data),
  delete: (id: string) => api.delete(`/videos/${id}`),
  bulkAction: (ids: string[], action: string) =>
    api.post('/videos/bulk', { ids, action }),
  upload: (formData: FormData, onProgress?: (pct: number) => void) =>
    api.post<Video>('/videos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (e.total && onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    }),
};

// ── Feeds ──
export const feedsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Feed>>('/feeds', { params }),
  get: (id: string) => api.get<Feed>(`/feeds/${id}`),
  create: (data: Partial<Feed>) => api.post<Feed>('/feeds', data),
  update: (id: string, data: Partial<Feed>) =>
    api.patch<Feed>(`/feeds/${id}`, data),
  delete: (id: string) => api.delete(`/feeds/${id}`),
  preview: (id: string) => api.get<string>(`/feeds/${id}/preview`),
};

// ── Categories ──
export const categoriesApi = {
  list: () => api.get<Category[]>('/categories'),
  create: (data: Partial<Category>) => api.post<Category>('/categories', data),
  update: (id: string, data: Partial<Category>) =>
    api.patch<Category>(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// ── Tags ──
export const tagsApi = {
  list: () => api.get<Tag[]>('/tags'),
  create: (data: { name: string }) => api.post<Tag>('/tags', data),
  update: (id: string, data: { name: string }) =>
    api.patch<Tag>(`/tags/${id}`, data),
  delete: (id: string) => api.delete(`/tags/${id}`),
};

// ── Playlists ──
export const playlistsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Playlist>>('/playlists', { params }),
  get: (id: string) => api.get<Playlist>(`/playlists/${id}`),
  create: (data: Partial<Playlist>) => api.post<Playlist>('/playlists', data),
  update: (id: string, data: Partial<Playlist>) =>
    api.patch<Playlist>(`/playlists/${id}`, data),
  delete: (id: string) => api.delete(`/playlists/${id}`),
};

// ── Users ──
export const usersApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<User>>('/users', { params }),
  get: (id: string) => api.get<User>(`/users/${id}`),
  create: (data: Partial<User>) => api.post<User>('/users', data),
  update: (id: string, data: Partial<User>) =>
    api.patch<User>(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// ── Analytics ──
export const analyticsApi = {
  overview: (params?: Record<string, unknown>) =>
    api.get<AnalyticsOverview>('/analytics/overview', { params }),
  views: (params?: Record<string, unknown>) =>
    api.get<ViewsData[]>('/analytics/views', { params }),
  topVideos: (params?: Record<string, unknown>) =>
    api.get<TopVideo[]>('/analytics/top-videos', { params }),
  devices: (params?: Record<string, unknown>) =>
    api.get<DeviceData[]>('/analytics/devices', { params }),
  countries: (params?: Record<string, unknown>) =>
    api.get<CountryData[]>('/analytics/countries', { params }),
};

// ── Settings ──
export const settingsApi = {
  get: () => api.get<AppSettings>('/settings'),
  update: (data: Partial<AppSettings>) => api.patch<AppSettings>('/settings', data),
};

// ── Audit Log ──
export const auditApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<AuditEntry>>('/audit-log', { params }),
};

// ── Types ──
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  avatar?: string;
  lastLogin?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Video {
  id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  status: 'draft' | 'processing' | 'published' | 'archived' | 'failed';
  category?: Category;
  categoryId?: string;
  tags?: Tag[];
  views: number;
  hlsUrl?: string;
  originalUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  scheduledAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  fileSize?: number;
  transcodingJobs?: TranscodingJob[];
}

export interface TranscodingJob {
  id: string;
  profile: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  outputUrl?: string;
  createdAt: string;
}

export interface Feed {
  id: string;
  name: string;
  type: 'mrss' | 'json' | 'atom';
  description?: string;
  itemCount: number;
  status: 'active' | 'inactive';
  sortOrder: 'newest' | 'oldest' | 'popular';
  itemLimit: number;
  filters?: {
    categoryIds?: string[];
    tagIds?: string[];
    status?: string;
  };
  videoIds?: string[];
  url?: string;
  lastUpdated: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  children?: Category[];
  videoCount?: number;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  videoCount?: number;
  createdAt: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  videoCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsOverview {
  totalViews: number;
  uniqueViewers: number;
  watchTimeMinutes: number;
  avgWatchTime: number;
  viewsTrend: number;
  viewersTrend: number;
}

export interface ViewsData {
  date: string;
  views: number;
  uniqueViewers: number;
}

export interface TopVideo {
  videoId: string;
  title: string;
  views: number;
  watchTime: number;
}

export interface DeviceData {
  device: string;
  count: number;
  percentage: number;
}

export interface CountryData {
  country: string;
  code: string;
  views: number;
}

export interface AppSettings {
  siteName: string;
  siteUrl: string;
  storageProvider: string;
  storageBucket: string;
  transcodingEnabled: boolean;
  transcodingProfiles: string[];
  authProvider: string;
  maxUploadSize: number;
}

export interface AuditEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  ip: string;
  timestamp: string;
}
