import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

const cleanCity = (city) => String(city || '').split('/')[0].trim();

export const useMetalRates = (city) => {
    const normalizedCity = cleanCity(city);
    return useQuery({
        queryKey: ['public-metal-rates', normalizedCity || 'default'],
        queryFn: async () => {
            const response = await api.get('/public/metal-rates', {
                params: normalizedCity ? { city: normalizedCity } : undefined,
            });
            return response.data;
        },
        staleTime: 30 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        retry: 1,
    });
};

export const useMetalRateCities = () => useQuery({
    queryKey: ['public-metal-rate-cities'],
    queryFn: async () => {
        const response = await api.get('/public/metal-rates/cities');
        return response.data;
    },
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
});
