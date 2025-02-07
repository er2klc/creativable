
import { useState, useEffect } from 'react';

interface IPLocationData {
  ipAddress: string;
  location: string;
}

export const useIPLocation = () => {
  const [ipLocationData, setIPLocationData] = useState<IPLocationData | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const fetchIPLocation = async () => {
    try {
      // Using ipapi.co as a more reliable service
      const ipResponse = await fetch('https://ipapi.co/json/');
      const ipData = await ipResponse.json();
      
      if (ipData.error) {
        throw new Error('IP API returned an error');
      }

      setIPLocationData({
        ipAddress: ipData.ip,
        location: `${ipData.city || ''}, ${ipData.country_name || ''}`
      });
    } catch (error) {
      console.error('Error fetching IP location:', error);
      
      // Fallback data if we can't get the real IP
      if (retryCount >= MAX_RETRIES) {
        setIPLocationData({
          ipAddress: 'unknown',
          location: 'Unknown Location'
        });
      } else {
        // Retry after a short delay
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    fetchIPLocation();
  }, [retryCount]);

  return ipLocationData;
};
