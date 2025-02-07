
export const generateUniqueSlug = (baseSlug: string): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 5);
  return `${baseSlug}-${timestamp}${randomStr}`;
};

export const generatePresentationUrl = (presentationId: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/p/${presentationId}`;
};

export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};
