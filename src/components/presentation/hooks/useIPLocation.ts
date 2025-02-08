
import { useState, useEffect } from 'react';

export interface IPLocationData {
  ipAddress: string;
  location: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  timezone: string;
}

export const useIPLocation = () => {
  const [ipLocationData, setIPLocationData] = useState<IPLocationData | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const fetchIPLocation = async () => {
    try {
      const ipResponse = await fetch('https://ipapi.co/json/');
      const ipData = await ipResponse.json();
      
      if (ipData.error) {
        throw new Error('IP API returned an error');
      }

      // Format location string with all available information
      const locationParts = [];
      if (ipData.city) locationParts.push(ipData.city);
      if (ipData.region) locationParts.push(ipData.region);
      if (ipData.country_name) locationParts.push(ipData.country_name);

      const locationString = locationParts.length > 0 
        ? locationParts.join(', ')
        : 'Unknown Location';

      setIPLocationData({
        ipAddress: ipData.ip || 'unknown',
        location: locationString,
        city: ipData.city || '',
        region: ipData.region || '',
        country: ipData.country_name || '',
        countryCode: ipData.country_code || '',
        timezone: ipData.timezone || ''
      });

      console.log('IP Location Data:', ipData);

    } catch (error) {
      console.error('Error fetching IP location:', error);
      
      if (retryCount >= MAX_RETRIES) {
        setIPLocationData({
          ipAddress: 'unknown',
          location: 'Unknown Location',
          city: '',
          region: '',
          country: '',
          countryCode: '',
          timezone: ''
        });
      } else {
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
