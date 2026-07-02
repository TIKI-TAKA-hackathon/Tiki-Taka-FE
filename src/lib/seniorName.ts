export const DEFAULT_SENIOR_NAME = '김순자';

export function seniorName(name?: string | null): string {
  const normalized = name?.trim().replace(/님$/, '');
  return normalized && normalized.length > 0 ? normalized : DEFAULT_SENIOR_NAME;
}

export function seniorNameWithHonorific(name?: string | null): string {
  return `${seniorName(name)}님`;
}
