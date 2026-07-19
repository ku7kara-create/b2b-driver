"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function FitBounds({ pickup, dropoff }: { pickup: [number, number]; dropoff: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds([pickup, dropoff]);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, pickup, dropoff]);
  return null;
}

export default function TripMap({ pickup, dropoff }: { pickup: [number, number]; dropoff: [number, number] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div style={{ height: "256px", width: "100%", backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px" }}><span style={{ color: "#9ca3af" }}>جاري تحميل الخريطة...</span></div>;

  return (
    <div style={{ height: "256px", width: "100%", overflow: "hidden", position: "relative", borderRadius: "12px" }}>
      <MapContainer center={pickup} zoom={11} style={{ height: "100%", width: "100%", borderRadius: "12px" }}>
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={pickup} />
        <Marker position={dropoff} />
        <FitBounds pickup={pickup} dropoff={dropoff} />
      </MapContainer>
    </div>
  );
}
