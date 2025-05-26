"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, AttributionControl } from "react-leaflet";
import L from "leaflet";
import { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";

// Add global styles once when component is loaded
const injectMapStyles = () => {
  // Only run in browser environment
  if (typeof window === "undefined") return;
  
  // Check if styles are already injected
  if (document.getElementById("map-picker-styles")) return;
  
  // Create style element
  const style = document.createElement("style");
  style.id = "map-picker-styles";
  style.innerHTML = `
    /* Hide attribution control */
    .leaflet-control-attribution {
      display: none !important;
    }
    
    /* Styling for map container */
    .leaflet-container {
      border-radius: 0.5rem;
      border: 1px solid hsl(240 5.9% 90%);
    }
    
    /* Improve controls visibility */
    .leaflet-control-zoom a {
      color: #333;
    }
  `;
  
  // Append to document head
  document.head.appendChild(style);
};

// Fix Leaflet marker icon issue in Next.js
const MarkerIcon = () => {
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== "undefined") {
      // Fix the missing icon issue in leaflet with Next.js
      // Using any to bypass the TypeScript error
      const iconDefault = L.Icon.Default as any;
      delete iconDefault.prototype._getIconUrl;
      
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      });
    }
  }, []);

  return null;
};

// Component to handle map click events and update marker position
const MapClickHandler = ({ onPositionChange }: { onPositionChange: (position: [number, number]) => void }) => {
  useMapEvents({
    click: (e: L.LeafletMouseEvent) => {
      onPositionChange([e.latlng.lat, e.latlng.lng]);
    }
  });
  
  return null;
};

interface MapPickerProps {
  value?: [number, number] | null;
  onChange: (value: [number, number] | null) => void;
  onAddressFound?: (address: {
    address_line1?: string;
    city?: string;
    state_province?: string;
    postal_code?: string;
    country?: string;
  }) => void;
  className?: string;
  defaultCenter?: [number, number]; // Default center coordinates
  zoom?: number;
  height?: string;
  width?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

// Function to perform reverse geocoding using Nominatim API
async function reverseGeocode(lat: number, lng: number) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
    const data = await response.json();
    
    if (data && data.address) {
      const address = data.address;
      
      return {
        address_line1: [
          address.road,
          address.house_number,
          address.neighbourhood,
          address.suburb
        ].filter(Boolean).join(', '),
        city: address.city || address.town || address.village || address.hamlet,
        state_province: address.state || address.region || address.county,
        postal_code: address.postcode,
        country: address.country
      };
    }
    return null;
  } catch (error) {
    console.error('Error during reverse geocoding:', error);
    return null;
  }
}

export function MapPicker({
  value,
  onChange,
  onAddressFound,
  className,
  defaultCenter = [-6.8235, 39.2695], // Default to Dar es Salaam, Tanzania
  zoom = 13,
  height = "300px",
  width = "100%",
  disabled = false,
  readOnly = false,
}: MapPickerProps) {
  // Inject CSS styles for the map
  useEffect(() => {
    injectMapStyles();
  }, []);
  const [position, setPosition] = useState<[number, number] | null>(value || null);
  const mapRef = useRef<LeafletMap | null>(null);

  // Update internal state when prop value changes
  useEffect(() => {
    if (value) {
      setPosition(value);
    }
  }, [value]);

  // Handle position change
  const handlePositionChange = async (newPosition: [number, number]) => {
    if (disabled || readOnly) return;
    
    setPosition(newPosition);
    onChange(newPosition);
    
    // Center map on the new position
    if (mapRef.current) {
      mapRef.current.setView(newPosition, mapRef.current.getZoom());
    }
    
    // Perform reverse geocoding if onAddressFound is provided
    if (onAddressFound) {
      const addressData = await reverseGeocode(newPosition[0], newPosition[1]);
      if (addressData) {
        onAddressFound(addressData);
      }
    }
  };

  // Handle clearing the coordinates
  const handleClear = () => {
    if (disabled || readOnly) return;
    
    setPosition(null);
    onChange(null);
  };

  // Handle using current location
  const handleUseCurrentLocation = () => {
    if (disabled || readOnly) return;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newPosition: [number, number] = [position.coords.latitude, position.coords.longitude];
          setPosition(newPosition);
          onChange(newPosition);
          
          // Center map on the new position
          if (mapRef.current) {
            mapRef.current.setView(newPosition, 15);
          }
          
          // Perform reverse geocoding if onAddressFound is provided
          if (onAddressFound) {
            const addressData = await reverseGeocode(newPosition[0], newPosition[1]);
            if (addressData) {
              onAddressFound(addressData);
            }
          }
        },
        (error) => {
          console.error("Error getting current location:", error);
        }
      );
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <MarkerIcon />
      
      <div className="flex gap-2 mb-2">
        {!disabled && !readOnly && (
          <>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              disabled={disabled}
            >
              Use Current Location
            </button>
            {position && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1 text-xs bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
                disabled={disabled}
              >
                Clear
              </button>
            )}
          </>
        )}
      </div>
      
      <div style={{ height, width }}>
        {typeof window !== "undefined" && (
          <MapContainer
            ref={mapRef}
            center={position || defaultCenter}
            zoom={zoom}
            style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
            attributionControl={false} // Remove attribution control
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {!disabled && !readOnly && (
              <MapClickHandler onPositionChange={handlePositionChange} />
            )}
            {position && <Marker position={position} />}
          </MapContainer>
        )}
      </div>
      
      {position && (
        <div className="text-sm text-muted-foreground mt-1">
          Latitude: {position[0].toFixed(6)}, Longitude: {position[1].toFixed(6)}
        </div>
      )}
    </div>
  );
}
