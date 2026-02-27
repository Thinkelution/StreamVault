import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feedsApi, type Feed } from '../api/client';
import toast from 'react-hot-toast';

export function useFeeds(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['feeds', params],
    queryFn: () => feedsApi.list(params).then((r) => r.data),
  });
}

export function useFeed(id: string | undefined) {
  return useQuery({
    queryKey: ['feed', id],
    queryFn: () => feedsApi.get(id!).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateFeed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Feed>) => feedsApi.create(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feeds'] });
      toast.success('Feed created');
    },
    onError: () => toast.error('Failed to create feed'),
  });
}

export function useUpdateFeed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Feed> }) =>
      feedsApi.update(id, data).then((r) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['feeds'] });
      qc.invalidateQueries({ queryKey: ['feed', id] });
      toast.success('Feed updated');
    },
    onError: () => toast.error('Failed to update feed'),
  });
}

export function useDeleteFeed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => feedsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feeds'] });
      toast.success('Feed deleted');
    },
    onError: () => toast.error('Failed to delete feed'),
  });
}

export function useFeedPreview(id: string | undefined) {
  return useQuery({
    queryKey: ['feed-preview', id],
    queryFn: () => feedsApi.preview(id!).then((r) => r.data),
    enabled: !!id,
  });
}
