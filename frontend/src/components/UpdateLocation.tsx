import React, { useState, useEffect } from "react";
import { useUserStore } from "../store/useUserStore";

// Define types for location data
interface GpsLocation {
  latitude: number;
  longitude: number;
  country?: string;
  city?: string;
  neighborhood?: string;
  method: "GPS";
}

// Define the full ip-api.com response type
interface IpApiResponse {
  status: "success" | "fail";
  message?: string; // Present if status is "fail"
  country: string;
  regionName: string;
  city: string;
  lat: number;
  lon: number;
  [key: string]: any; // Allow extra fields (ip-api returns more, like "isp")
}

// Define the IpLocation type for state
interface IpLocation {
  city: string;
  regionName: string;
  country: string;
  lat: number;
  lon: number;
  method: "IP";
}

export type Location = GpsLocation | IpLocation;

const UpdateLocation: React.FC = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { updateLocation } = useUserStore();

  const getGpsLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position: GeolocationPosition) => {
          const { latitude, longitude } = position.coords;
          updateLocation({ latitude, longitude });
          const gpsData: GpsLocation = { latitude, longitude, method: "GPS" };
          setLocation(gpsData);

          // Reverse geocode with Nominatim
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=18`
            );
            const data = await response.json();
            const country = data.address.country || "Country not found";
            const city = data.address.city || "City not found";
            const neighborhood =
              data.address.neighbourhood ||
              data.address.suburb ||
              data.address.quarter ||
              "Neighborhood not found";
            setLocation(
              (prev: any) =>
                ({ ...prev, country, city, neighborhood } as GpsLocation)
            );
          } catch (err) {
            setError("Error fetching neighborhood from Nominatim");
          }
        },
        (err: GeolocationPositionError) => {
          setError(`GPS Error: ${err.message}`);
          getIpLocation();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      getIpLocation();
    }
  };

  const getIpLocation = async () => {
    try {
      // setError(null);
      const response = await fetch("http://ip-api.com/json/");
      const data = (await response.json()) as IpApiResponse; // Type the raw response
      if (data.status === "success") {
        // Map the response to IpLocation
        const ipLocation: IpLocation = {
          city: data.city,
          regionName: data.regionName,
          country: data.country,
          lat: data.lat,
          lon: data.lon,
          method: "IP",
        };
        updateLocation({
          latitude: data.lat,
          longitude: data.lon,
          location: data.country,
          address: data.city,
        });
        setLocation(ipLocation);
      } else {
        setError(`IP geolocation failed: ${data.message || "Unknown error"}`);
      }
    } catch (err) {
      setError("Failed to fetch IP location");
    }
  };

  useEffect(() => {
    getGpsLocation();
  }, []);

  return <div className="hidden">{location?.city} {error}</div>;
};

export default UpdateLocation;
