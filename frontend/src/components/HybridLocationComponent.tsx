import { MapPin, MapPinOff } from "lucide-react";
import React, { useState, useEffect } from "react";
import useAuthStore from "../store/useAuthStore";

// Define types for location data
interface GpsLocation {
  latitude: number;
  longitude: number;
  country?: string;
  city?: string;
  neighborhood?: string;
  method: "GPS";
}

// // Define the full ip-api.com response type
// interface IpApiResponse {
//   status: "success" | "fail";
//   message?: string; // Present if status is "fail"
//   country: string;
//   regionName: string;
//   city: string;
//   lat: number;
//   lon: number;
//   [key: string]: any; // Allow extra fields (ip-api returns more, like "isp")
// }

// Define the IpLocation type for state
interface IpLocation {
  city: string;
  regionName: string;
  country: string;
  lat: number;
  lon: number;
  method: "IP";
}

type Location = GpsLocation | IpLocation;

const HybridLocationComponent: React.FC = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { authUser } = useAuthStore();

  const getGpsLocation = () => {
    // if (!authUser?.latitude || !authUser?.longitude) {
      if (navigator.geolocation) {
        console.log(authUser?.latitude, authUser?.longitude);
        navigator.geolocation.getCurrentPosition(
          async (position: GeolocationPosition) => {
            const { latitude, longitude } = position.coords;
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
                (prev) =>
                  ({ ...prev, country, city, neighborhood } as GpsLocation)
              );
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
    // }
  };

  useEffect(() => {
    getGpsLocation();
  }, []);

  return (
    <div className="flex text-gray-700 text-sm space-x-1">
      {error ? (
        // <p>Error: {error}</p>
        <MapPinOff size={18} />
      ) : location ? (
        <>
          {/* <p>Method: {location.method}</p> */}
          {location.method === "GPS" ? (
            <>
              {/* <p>Latitude: {(location as GpsLocation).latitude}</p>
              <p>Longitude: {(location as GpsLocation).longitude}</p>
              <p>Country: {(location as GpsLocation).country || 'Loading...'}</p>
              <p>City: {(location as GpsLocation).city || 'Loading...'}</p>
              <p>Neighborhood: {(location as GpsLocation).neighborhood || 'Loading...'}</p> */}
              <MapPin size={18} />{" "}
              <span>
                {(location as GpsLocation).neighborhood}
                {", "}
                {(location as GpsLocation).city}
                {", "}
                {(location as GpsLocation).country || "Loading..."}
              </span>
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

export default HybridLocationComponent;
