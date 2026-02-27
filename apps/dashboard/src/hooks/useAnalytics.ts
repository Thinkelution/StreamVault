import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/client';

export function useAnalyticsOverview(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['analytics-overview', params],
    queryFn: () => analyticsApi.overview(params).then((r) => r.data),
  });
}

export function useAnalyticsViews(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['analytics-views', params],
    queryFn: () => analyticsApi.views(params).then((r) => r.data),
  });
}

export function useAnalyticsTopVideos(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['analytics-top-videos', params],
    queryFn: () => analyticsApi.topVideos(params).then((r) => r.data),
  });
}

export function useAnalyticsDevices(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['analytics-devices', params],
    queryFn: () => analyticsApi.devices(params).then((r) => r.data),
  });
}

export function useAnalyticsCountries(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['analytics-countries', params],
    queryFn: () => analyticsApi.countries(params).then((r) => r.data),
  });
}
