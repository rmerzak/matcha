import React, { useState } from "react";
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

export type Location = GpsLocation;

interface EditLocationProps {
  latitude: string;
  longitude: string;
  setLatitude: (lat: string) => void;
  setLongitude: (lon: string) => void;
}

const EditLocationComponent: React.FC<EditLocationProps> = ({
  latitude,
  longitude,
  setLatitude,
  setLongitude,
}) => {
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
            setLatitude(latitude.toString());
            setLongitude(longitude.toString());
          } catch (err) {
            setError("Error fetching neighborhood from Nominatim");
          }
        },
        (err: GeolocationPositionError) => {
          setError(`GPS Error: ${err.message}`);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <button
          type="button"
          onClick={() => {
            getGpsLocation();
            // Logic to open a modal or redirect to a location editing page
            console.log("Open location editor");
          }}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm
            text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2
            focus:ring-offset-2 focus:ring-purple-500 flex-col"
        >
          <span>Update Location</span>
        </button>
        {location && (
          <div className="mt-2 text-sm text-gray-600">
            <p>Latitude: {location.latitude}</p>
            <p>Longitude: {location.longitude}</p>
            {/* <p>Country: {location.country || "Not available"}</p>
            <p>City: {location.city || "Not available"}</p>
            <p>
              Neighborhood: {location.neighborhood || "Not available"}
            </p> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditLocationComponent;
