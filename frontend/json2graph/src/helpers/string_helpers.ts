export const isValidString = (value?: string | null) => {
  return value && value.trim().length > 0;
};
