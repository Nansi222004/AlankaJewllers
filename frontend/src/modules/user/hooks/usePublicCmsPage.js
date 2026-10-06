import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

const toSectionsArray = (res) => {
  const payload = res?.data?.data || res?.data || {};
  const sections = payload?.sections;
  return Array.isArray(sections) ? sections : [];
};

export const usePublicCmsPage = (pageKey) => {
  const normalizedKey = String(pageKey || '').trim();

  return useQuery({
    queryKey: ['public-cms', 'page', normalizedKey],
    enabled: Boolean(normalizedKey),
    queryFn: async () => api.get(`public/cms/pages/${normalizedKey}`),
    select: toSectionsArray,
    // CMS content is managed by admins — changes infrequently.
    // 5 minutes avoids repeated refetches on collection page navigations.
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
};
