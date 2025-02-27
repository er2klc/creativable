
// Hilfsfunktion für YouTube Video IDs
export const getVideoId = (url: string): string | null => {
  // YouTube URL patterns
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
    /^[a-zA-Z0-9_-]{11}$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

// Hilfsfunktion für Slug-Generierung
export const generateSlug = (title: string, videoId: string): string => {
  // Einfachen slug aus Titel erstellen
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Zeitstempel hinzufügen, um Einzigartigkeit zu gewährleisten
  const timestamp = Date.now().toString(36);
  
  return `${baseSlug}-${videoId}-${timestamp}`;
};

// Hilfsfunktion zum Parsen von YouTube-Daten
export const parseYoutubeData = (data: any) => {
  return {
    videoId: data?.videoId || "",
    title: data?.title || "YouTube Video",
    presentationUrl: data?.presentationUrl || "",
    thumbnail: data?.thumbnail || `https://img.youtube.com/vi/${data?.videoId}/hqdefault.jpg`
  };
};

// Die Hilfsfunktionen als Objekt exportieren
export const presentationUtils = {
  getVideoId,
  generateSlug,
  parseYoutubeData
};
