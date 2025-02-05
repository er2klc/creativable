
export const generateUniqueSlug = (baseSlug: string): string => {
  const timestamp = new Date().getTime();
  return `${baseSlug}-${timestamp}`;
};

export const generatePresentationUrl = (leadId: string, presentationId: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/presentation/${leadId}/${presentationId}`;
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
