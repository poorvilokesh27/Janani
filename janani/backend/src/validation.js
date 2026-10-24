export const email = (value) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 180;
export const requiredText = (value, max = 255) => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max;
export const date = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
export const coordinates = (lat, lng) => Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) && Number(lat) >= -90 && Number(lat) <= 90 && Number(lng) >= -180 && Number(lng) <= 180;
export const radius = (value) => Number.isFinite(Number(value)) && Number(value) > 0 && Number(value) <= 100;
