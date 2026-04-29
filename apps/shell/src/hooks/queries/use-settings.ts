import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api-fetch';
import { settingsKey } from '../keys';

export type SettingsData = {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  hasPassword: boolean;
};

export function useSettingsQuery() {
  return useQuery({
    queryKey: settingsKey,
    queryFn: () => apiFetch<SettingsData>('/api/account/settings'),
  });
}
