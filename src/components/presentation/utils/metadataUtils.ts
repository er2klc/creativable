
import { IPLocationData } from "../hooks/useIPLocation";
import { PresentationPageData } from "../types";

interface ViewMetadata {
  type: string;
  event_type: string;
  title: string;
  url: string;
  id: string;
  view_id: string;
  ip: string;
  location: string;
  location_metadata: {
    city: string;
    region: string;
    country: string;
    countryCode: string;
    timezone: string;
  };
  presentationUrl: string;
  video_progress: number;
  completed: boolean;
}

export const createViewMetadata = (
  pageData: PresentationPageData,
  viewId: string,
  ipLocationData: IPLocationData | null
): ViewMetadata => {
  // Create a detailed location object
  const locationMetadata = {
    city: ipLocationData?.city || '',
    region: ipLocationData?.region || '',
    country: ipLocationData?.country || '',
    countryCode: ipLocationData?.countryCode || '',
    timezone: ipLocationData?.timezone || ''
  };

  return {
    type: 'youtube',
    event_type: 'video_opened',
    title: pageData.title,
    url: pageData.video_url,
    id: viewId,
    view_id: viewId,
    ip: ipLocationData?.ipAddress || 'unknown',
    location: ipLocationData?.location || 'Unknown Location',
    location_metadata: locationMetadata,
    presentationUrl: pageData.presentationUrl,
    video_progress: 0,
    completed: false
  };
};
