import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { videosApi, type Video } from '../api/client';
import toast from 'react-hot-toast';

export function useVideos(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['videos', params],
    queryFn: () => videosApi.list(params).then((r) => r.data),
  });
}

export function useVideo(id: string | undefined) {
  return useQuery({
    queryKey: ['video', id],
    queryFn: () => videosApi.get(id!).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Video>) => videosApi.create(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['videos'] });
      toast.success('Video created');
    },
    onError: () => toast.error('Failed to create video'),
  });
}

export function useUpdateVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Video> }) =>
      videosApi.update(id, data).then((r) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['videos'] });
      qc.invalidateQueries({ queryKey: ['video', id] });
      toast.success('Video updated');
    },
    onError: () => toast.error('Failed to update video'),
  });
}

export function useDeleteVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => videosApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['videos'] });
      toast.success('Video deleted');
    },
    onError: () => toast.error('Failed to delete video'),
  });
}

export function useBulkVideoAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, action }: { ids: string[]; action: string }) =>
      videosApi.bulkAction(ids, action),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['videos'] });
      toast.success('Bulk action completed');
    },
    onError: () => toast.error('Bulk action failed'),
  });
}
