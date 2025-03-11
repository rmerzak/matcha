import React, { useState, useEffect } from 'react';

// Define types for location data
interface GpsLocation {
  latitude: number;
  longitude: number;
  method: 'GPS';
}

interface IpLocation {
  city: string;
  region: string;
  country: string;
  loc: string; // e.g., "37.7749,-122.4194"
  method: 'IP';
}

type Location = GpsLocation | IpLocation;

const HybridLocationComponent: React.FC = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getGpsLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            method: 'GPS',
          });
        },
        (err: GeolocationPositionError) => {
          setError(`GPS Error: ${err.message}`);
          // Fallback to IP if GPS denied
          getIpLocation();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      getIpLocation();
    }
  };

  const getIpLocation = async () => {
    try {
        console.log("getIpLocation();")
      const response = await fetch('https://ipinfo.io/json?token=e95cd1398f9562');
      const data: IpLocation = await response.json();
      console.log(data)
      setLocation({
        city: data.city,
        region: data.region,
        country: data.country,
        loc: data.loc,
        method: 'IP',
      });
      setError(null)
    } catch (err) {
      setError('Failed to fetch IP location');
    }
  };

  useEffect(() => {
    getGpsLocation();
    console.log(location?.method)
  }, []);

  return (
    <div className="pt-6 flex flex-col gap-4">
      {error ? (
        <p>Error: {error}</p>
      ) : location ? (
        <>
          <p>Method: {location.method}</p>
          {location.method === 'GPS' ? (
            <>
              <p>Latitude: {(location as GpsLocation).latitude}</p>
              <p>Longitude: {(location as GpsLocation).longitude}</p>
            </>
          ) : (
            <>
              <p>City: {(location as IpLocation).city}</p>
              <p>Region: {(location as IpLocation).region}</p>
              <p>Country: {(location as IpLocation).country}</p>
              <p>Approx Coordinates: {(location as IpLocation).loc}</p>
            </>
          )}
        </>
      ) : (
        <p>Fetching location...</p>
      )}
    </div>
  );
};

export default HybridLocationComponent;