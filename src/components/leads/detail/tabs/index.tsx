
// Exportiere alle Tab-Komponenten
export * from './NoteTab';
export * from './TaskTab';
export * from './MessageTab';
export * from './PresentationTab';

// Exportiere die Tab-Konfiguration
export * from './config/tabsConfig';

// Exportiere die Tab-Hilfskomponenten
export * from './components/TabHeader';
export * from './components/TabContent';

// Exportiere auch die Tab-Präsentations-Hilfsfunktionen
export const presentationUtils = {
  getVideoId(url: string): string | null {
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
  },
  
  generateSlug(title: string, videoId: string): string {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    const timestamp = Date.now().toString(36);
    
    return `${baseSlug}-${videoId}-${timestamp}`;
  },
  
  parseYoutubeData(data: any) {
    return {
      videoId: data?.videoId || "",
      title: data?.title || "YouTube Video",
      presentationUrl: data?.presentationUrl || "",
      thumbnail: data?.thumbnail || `https://img.youtube.com/vi/${data?.videoId}/hqdefault.jpg`
    };
  }
};
