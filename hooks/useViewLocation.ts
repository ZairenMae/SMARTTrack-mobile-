import { useState, useEffect } from "react";
import * as Location from "expo-location";

const useViewLocation = () => {
    const [address, setAddress] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchLocation = async () => {
        try {
            console.log("Requesting location permissions...");
            const { status } =
                await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setError("Permission to access location was denied");
                return;
            }

            console.log("Fetching current location...");
            const currentLocation = await Location.getCurrentPositionAsync({});
            console.log("Current location fetched:", currentLocation);

            const { latitude, longitude } = currentLocation.coords;

            console.log("Fetching address from Nominatim...");
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();

            if (data.error) {
                setError("Unable to fetch address");
            } else {
                const formattedAddress =
                    data.display_name || "Address not found";
                console.log("Address fetched:", formattedAddress);
                setAddress(formattedAddress);
            }
        } catch (err) {
            console.error("Error fetching address:", err);
            setError("Unable to fetch address");
        }
    };

    useEffect(() => {
        fetchLocation();
    }, []);

    return { address, error };
};

export default useViewLocation;
