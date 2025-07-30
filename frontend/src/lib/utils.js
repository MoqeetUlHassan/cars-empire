import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price, currency = 'PKR') {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: currency === 'PKR' ? 'USD' : currency, // Fallback since PKR might not be supported
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price).replace('$', currency === 'PKR' ? 'Rs ' : '$');
}

export function formatNumber(number) {
  return new Intl.NumberFormat('en-PK').format(number);
}

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function getImageUrl(path, fallback = '/placeholder-car.jpg') {
  if (!path) return fallback;
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${path}`;
}

export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
}

export function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}
