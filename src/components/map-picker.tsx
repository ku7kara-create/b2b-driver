"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function SizeInvalidator() {
  const map = useMap();
  useEffect(() => { setTimeout(() => map.invalidateSize(), 100); }, [map]);
  return null;
}

function LocationPicker({ onSelect, onClose }: { onSelect: (lat: number, lng: number) => void; onClose: () => void }) {
  const [position, setPosition] = useState<[number, number]>([32.8872, 13.1913]); // Tripoli, Libya

  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ backgroundColor: "white", borderRadius: "16px", width: "90%", maxWidth: "500px", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden", direction: "rtl" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: "bold", fontSize: "16px" }}>اختر الموقع على الخريطة</span>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#6b7280" }}>✕</button>
        </div>
        <div style={{ height: "450px", width: "100%", position: "relative" }}>
          <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={position} draggable={true} eventHandlers={{ dragend: (e) => { const m = e.target; const p = m.getLatLng(); setPosition([p.lat, p.lng]); } }} />
            <MapClickHandler />
            <SizeInvalidator />
          </MapContainer>
        </div>
        <div style={{ padding: "12px 16px", borderTop: "1px solid #e5e7eb", display: "flex", gap: "8px" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", background: "white", color: "#374151", fontWeight: "bold", cursor: "pointer" }}>إلغاء</button>
          <button onClick={() => { onSelect(position[0], position[1]); onClose(); }} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "none", background: "#E05A2B", color: "white", fontWeight: "bold", cursor: "pointer" }}>تأكيد الموقع</button>
        </div>
      </div>
    </div>
  );
}

export default function MapPickerModal({ onSelect, onClose }: { onSelect: (lat: number, lng: number) => void; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return <LocationPicker onSelect={onSelect} onClose={onClose} />;
}
