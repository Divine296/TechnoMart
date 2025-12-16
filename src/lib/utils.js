import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** @param {...import('clsx').ClassValue} inputs */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatOrderNumber(value) {
  if (value === null || value === undefined) return '';
  const trimmed = String(value).trim();
  if (!trimmed) return '';

  const normalized = trimmed.replace(/^#+/, '');
  const parts = normalized.split('-').filter(Boolean);
  if (parts.length === 0) {
    return normalized;
  }

  const [prefix, ...rest] = parts;
  if (rest.length === 0) {
    return prefix.toUpperCase();
  }

  const upperSegments = rest.map((segment) => segment.toUpperCase());
  return [prefix.toUpperCase(), ...upperSegments].join('-');
}
