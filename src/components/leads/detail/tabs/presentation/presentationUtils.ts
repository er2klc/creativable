export const getVideoId = (url: string) => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : false;
};

export const generateSlug = (baseTitle: string, videoId: string) => {
  const timestamp = new Date().getTime();
  const sanitizedTitle = baseTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${sanitizedTitle}-${videoId}-${timestamp}`;
};

export const calculateExpiryDate = (expiresIn: string) => {
  if (expiresIn === 'never') return null;
  
  const now = new Date();
  const days = {
    '1day': 1,
    '7days': 7,
    '30days': 30
  }[expiresIn] || 0;
  
  return new Date(now.setDate(now.getDate() + days));
};