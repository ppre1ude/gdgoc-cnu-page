export function toOptionalActivityStartIso(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return undefined;
  }

  const date = new Date(trimmedValue);

  if (Number.isNaN(date.getTime())) {
    throw new Error('Activity start date is invalid.');
  }

  return date.toISOString();
}
