export const formatPhoneNumber = (value: string): string => {
  // Remove all non-numeric characters
  const numericValue = value.replace(/\D/g, '');
  
  // Apply formatting based on length
  if (numericValue.length <= 3) {
    return numericValue;
  } else if (numericValue.length <= 6) {
    return `(${numericValue.slice(0, 3)}) ${numericValue.slice(3)}`;
  } else if (numericValue.length <= 10) {
    return `(${numericValue.slice(0, 3)}) ${numericValue.slice(3, 6)}-${numericValue.slice(6)}`;
  } else {
    // Handle numbers longer than 10 digits
    return `(${numericValue.slice(0, 3)}) ${numericValue.slice(3, 6)}-${numericValue.slice(6, 10)}`;
  }
};

export const parsePhoneNumber = (formattedValue: string): string => {
  // Remove all non-numeric characters for storage
  return formattedValue.replace(/\D/g, '');
};

export const isValidPhoneNumber = (value: string): boolean => {
  const numericValue = value.replace(/\D/g, '');
  return numericValue.length === 10;
};