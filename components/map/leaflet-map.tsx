"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

interface LeafletMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  height?: string;
  className?: string;
  markerTitle?: string;
}

export function LeafletMap({
  latitude,
  longitude,
  zoom = 15,
  height = "h-64",
  className = "",
  markerTitle = "Vị trí homestay",
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initMap = async () => {
      try {
        // Kiểm tra nếu Leaflet đã được load
        if (!(window as any).L) {
          // Load CSS
          const cssLink = document.createElement("link");
          cssLink.rel = "stylesheet";
          cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          cssLink.integrity =
            "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
          cssLink.crossOrigin = "";
          document.head.appendChild(cssLink);

          // Load JS
          const script = document.createElement("script");
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.integrity =
            "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
          script.crossOrigin = "";

          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        if (!mounted || !mapRef.current) return;

        const L = (window as any).L;

        // Xóa map cũ nếu có
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        // Tạo map mới
        const map = L.map(mapRef.current).setView([latitude, longitude], zoom);

        // Thêm tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(map);

        // Thêm marker chính
        const mainMarker = L.marker([latitude, longitude]).addTo(map);
        mainMarker.bindPopup(`<b>${markerTitle}</b><br>Vị trí homestay`);

        // Thêm các điểm quan tâm
        const pois = [
          { lat: latitude + 0.002, lng: longitude + 0.001, name: "Bãi biển" },
          {
            lat: latitude - 0.001,
            lng: longitude + 0.002,
            name: "Chợ địa phương",
          },
          { lat: latitude + 0.001, lng: longitude - 0.001, name: "Nhà hàng" },
          { lat: latitude - 0.002, lng: longitude - 0.001, name: "Siêu thị" },
        ];

        pois.forEach((poi) => {
          const marker = L.circleMarker([poi.lat, poi.lng], {
            radius: 8,
            fillColor: "#3b82f6",
            color: "#ffffff",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8,
          }).addTo(map);
          marker.bindPopup(poi.name);
        });

        mapInstanceRef.current = map;
        setIsLoaded(true);
      } catch (err) {
        console.error("Error loading map:", err);
        setError("Không thể tải bản đồ");
      }
    };

    initMap();

    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, zoom, markerTitle]);

  if (error) {
    return (
      <div
        className={`${height} ${className} bg-gray-100 rounded-lg flex items-center justify-center border`}
      >
        <div className="text-center text-muted-foreground">
          <MapPin className="h-8 w-8 mx-auto mb-2" />
          <p>Không thể tải bản đồ</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${height} ${className} relative rounded-lg border overflow-hidden`}
    >
      <div
        ref={mapRef}
        className="w-full h-full"
        style={{ minHeight: "256px" }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 animate-pulse" />
            <p>Đang tải bản đồ...</p>
          </div>
        </div>
      )}
    </div>
  );
}
