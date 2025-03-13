import React, { useState, useEffect } from 'react';

// Define types for location data
interface GpsLocation {
  latitude: number;
  longitude: number;
  neighborhood?: string;
  method: 'GPS';
}

interface IpApiResponse {
  status: 'success' | 'fail';
  message?: string;
  country: string;
  regionName: string;
  city: string;
  lat: number;
  lon: number;
  [key: string]: any;
}

interface IpLocation {
  city: string;
  regionName: string;
  country: string;
  lat: number;
  lon: number;
  method: 'IP';
}

type Location = GpsLocation | IpLocation;

const EditLocationComponent: React.FC = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualLat, setManualLat] = useState<string>(''); // String for input handling
  const [manualLon, setManualLon] = useState<string>('');

  const getGpsLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position: GeolocationPosition) => {
          const { latitude, longitude } = position.coords;
          updateLocation(latitude, longitude);
        },
        (err: GeolocationPositionError) => {
          setError(`GPS Error: ${err.message}`);
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
      const response = await fetch('http://ip-api.com/json/');
      const data = await response.json() as IpApiResponse;
      if (data.status === 'success') {
        const ipLocation: IpLocation = {
          city: data.city,
          regionName: data.regionName,
          country: data.country,
          lat: data.lat,
          lon: data.lon,
          method: 'IP',
        };
        setLocation(ipLocation);
      } else {
        setError(`IP geolocation failed: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      setError('Failed to fetch IP location');
    }
  };

  const updateLocation = async (latitude: number, longitude: number) => {
    const gpsData: GpsLocation = { latitude, longitude, method: 'GPS' };
    setLocation(gpsData);

    // Reverse geocode with Nominatim
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=18`
      );
      const data = await response.json();
      const neighborhood = data.address.neighbourhood || data.address.suburb || 'Neighborhood not found';
      setLocation((prev) => ({ ...prev, neighborhood } as GpsLocation));
    } catch (err) {
      setError('Error fetching neighborhood from Nominatim');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setError('Invalid latitude or longitude values. Latitude: -90 to 90, Longitude: -180 to 180');
      return;
    }

    setError(null);
    updateLocation(lat, lon);
    setManualLat(''); // Clear inputs after submission
    setManualLon('');
  };

  useEffect(() => {
    getGpsLocation();
  }, []);

  return (
    <div className="pt-6 flex flex-col gap-4">
      {/* Manual input form */}
      <form onSubmit={handleManualSubmit} className="flex flex-col gap-2">
        <label>
          Latitude:
          <input
            type="text"
            value={manualLat}
            onChange={(e) => setManualLat(e.target.value)}
            placeholder="e.g., 37.7749"
            className="ml-2 border p-1"
          />
        </label>
        <label>
          Longitude:
          <input
            type="text"
            value={manualLon}
            onChange={(e) => setManualLon(e.target.value)}
            placeholder="e.g., -122.4194"
            className="ml-2 border p-1"
          />
        </label>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Set Custom Location
        </button>
      </form>

      {/* Display location */}
      {error ? (
        <p>Error: {error}</p>
      ) : location ? (
        <>
          <p>Method: {location.method}</p>
          {location.method === 'GPS' ? (
            <>
              <p>Latitude: {(location as GpsLocation).latitude}</p>
              <p>Longitude: {(location as GpsLocation).longitude}</p>
              <p>Neighborhood: {(location as GpsLocation).neighborhood || 'Loading...'}</p>
            </>
          ) : (
            <>
              <p>City: {(location as IpLocation).city}</p>
              <p>Region: {(location as IpLocation).regionName}</p>
              <p>Country: {(location as IpLocation).country}</p>
              <p>Approx Latitude: {(location as IpLocation).lat}</p>
              <p>Approx Longitude: {(location as IpLocation).lon}</p>
            </>
          )}
        </>
      ) : (
        <p>Fetching location...</p>
      )}
    </div>
  );
};

export default EditLocationComponent;