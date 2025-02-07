
import { useState, useEffect } from 'react';

interface IPLocationData {
  ipAddress: string;
  location: string;
}

export const useIPLocation = () => {
  const [ipLocationData, setIPLocationData] = useState<IPLocationData | null>(null);

  const fetchIPLocation = async () => {
    try {
      const ipResponse = await fetch('https://api.db-ip.com/v2/free/self');
      const ipData = await ipResponse.json();
      setIPLocationData({
        ipAddress: ipData.ipAddress,
        location: `${ipData.city || ''}, ${ipData.countryName || ''}`
      });
    } catch (error) {
      console.error('Error fetching IP location:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchIPLocation();
  }, []);

  return ipLocationData;
};

