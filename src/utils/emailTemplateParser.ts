export const parseEmailTemplate = (
  template: string,
  variables: Record<string, string>
): string => {
  let parsed = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{${key}}`, 'g');
    parsed = parsed.replace(regex, value);
  });
  
  return parsed;
};
