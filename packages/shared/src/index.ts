export enum VideoStatus {
  DRAFT = 'draft',
  PROCESSING = 'processing',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
  FAILED = 'failed',
}

export enum TranscodingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  EDITOR = 'editor',
  REVIEWER = 'reviewer',
  VIEWER = 'viewer',
}

export enum FeedType {
  MRSS = 'mrss',
  JSON = 'json',
  ATOM = 'atom',
}

export enum FeedItemSortOrder {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  MANUAL = 'manual',
  MOST_VIEWED = 'most_viewed',
}

export interface VideoMetadata {
  title: string;
  description?: string;
  shortDescription?: string;
  slug: string;
  seoTitle?: string;
  seoDescription?: string;
  customFields?: Record<string, unknown>;
}

export interface TranscodingProfile {
  name: string;
  width: number;
  height: number;
  videoBitrate: string;
  audioBitrate: string;
  codec: 'h264' | 'h265' | 'vp9' | 'av1';
}

export const DEFAULT_TRANSCODING_PROFILES: TranscodingProfile[] = [
  { name: '360p', width: 640, height: 360, videoBitrate: '800k', audioBitrate: '96k', codec: 'h264' },
  { name: '480p', width: 854, height: 480, videoBitrate: '1500k', audioBitrate: '128k', codec: 'h264' },
  { name: '720p', width: 1280, height: 720, videoBitrate: '3000k', audioBitrate: '128k', codec: 'h264' },
  { name: '1080p', width: 1920, height: 1080, videoBitrate: '6000k', audioBitrate: '192k', codec: 'h264' },
];

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
