"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { callBackend } from "../../../lib/api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface LocationStat {
  country: string;
  city: string;
  count: number;
  coordinates?: [number, number];
}

interface UsersByLocationResponse {
  users: Array<{
    user_id: string;
    email: string;
    displayName?: string;
    profile?: {
      location?: {
        city?: string;
        country?: string;
        coordinates?: [number, number];
      };
    };
  }>;
  locationStats: LocationStat[];
  total: number;
}

export default function LocationsPage() {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [data, setData] = useState<UsersByLocationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"table" | "map">("table");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = selectedCountry ? `?country=${selectedCountry}` : "";
        const response = await callBackend<UsersByLocationResponse>(
          supabase,
          `/api/v1/admin/users/location${params}`,
          { method: "GET" }
        );
        if (response.success && response.data) {
          setData(response.data);
        } else {
          router.push("/");
        }
      } catch (err) {
        // console.error("Failed to fetch location data:", err);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [supabase, router, selectedCountry]);

  // Initialize map and markers when data is ready
  useEffect(() => {
    if (view !== "map" || !data || !mapRef.current) return;

    // Get all locations with coordinates
    const locationsWithCoords = data.locationStats.filter(
      (stat) => stat.coordinates && Array.isArray(stat.coordinates) && stat.coordinates.length === 2
    );

    // Also get individual user locations if they have coordinates
    const userLocations = data.users
      .filter(
        (user) =>
          user.profile?.location?.coordinates &&
          Array.isArray(user.profile.location.coordinates) &&
          user.profile.location.coordinates.length === 2
      )
      .map((user) => {
        const loc = user.profile!.location!;
        return {
          city: loc.city || "Unknown",
          country: loc.country || "Unknown",
          coordinates: loc.coordinates!,
          count: 1,
        };
      });

    // Combine and deduplicate by coordinates
    const allLocations = new Map<string, typeof locationsWithCoords[0]>();
    
    locationsWithCoords.forEach((stat) => {
      const key = `${stat.coordinates![0]},${stat.coordinates![1]}`;
      allLocations.set(key, stat);
    });

    userLocations.forEach((userLoc) => {
      const key = `${userLoc.coordinates[0]},${userLoc.coordinates[1]}`;
      if (!allLocations.has(key)) {
        allLocations.set(key, userLoc);
      } else {
        const existing = allLocations.get(key)!;
        existing.count = (existing.count || 0) + 1;
      }
    });

    const finalLocations = Array.from(allLocations.values());

    if (finalLocations.length === 0) {
      return;
    }

    // Initialize map
    if (!mapInstanceRef.current) {
      // Coordinates are stored as [longitude, latitude] in the database
      // Leaflet expects [latitude, longitude]
      const firstCoords = finalLocations[0].coordinates!;
      const center: [number, number] = [firstCoords[1], firstCoords[0]]; // Swap: [lng, lat] -> [lat, lng]
      
      mapInstanceRef.current = L.map(mapRef.current!, {
        center,
        zoom: 2,
      });

      // Add OpenStreetMap tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      mapInstanceRef.current!.removeLayer(marker);
    });
    markersRef.current = [];

    // Create markers for each location
    finalLocations.forEach((stat) => {
      if (!stat.coordinates || !Array.isArray(stat.coordinates) || stat.coordinates.length !== 2) {
        return;
      }

      // Coordinates are [longitude, latitude], Leaflet needs [latitude, longitude]
      const [lng, lat] = stat.coordinates;
      
      // Validate coordinates
      if (typeof lng !== "number" || typeof lat !== "number") {
        return;
      }
      
      if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        return;
      }
      
      const position: [number, number] = [lat, lng];
      
      // Create custom icon with count badge
      const icon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            background-color: #E94057;
            color: white;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 12px;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">
            ${stat.count || 1}
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker(position, { icon }).addTo(mapInstanceRef.current!);

      // Create popup content
      const popupContent = `
        <div style="padding: 8px; min-width: 150px;">
          <h3 style="margin: 0 0 8px 0; font-weight: 600; color: #2A1F2D;">
            ${stat.city || "Unknown City"}, ${stat.country || "Unknown Country"}
          </h3>
          <p style="margin: 0; color: #6F6077; font-size: 14px;">
            <strong style="color: #E94057;">${stat.count || 1}</strong> ${(stat.count || 1) === 1 ? "user" : "users"}
          </p>
          <p style="margin: 4px 0 0 0; color: #6F6077; font-size: 12px;">
            ${data.total > 0 ? (((stat.count || 1) / data.total) * 100).toFixed(1) : "0"}% of total
          </p>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (markersRef.current.length > 0) {
      const group = new L.FeatureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [view, data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[#6F6077]">Loading locations...</div>
      </div>
    );
  }

  if (!data) return null;

  const uniqueCountries = Array.from(
    new Set(data.locationStats.map((stat) => stat.country))
  ).sort();

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-[#2A1F2D] mb-2">Users by Location</h1>
          <p className="text-sm md:text-base text-[#6F6077]">See where your users are coming from</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("table")}
            className={`px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all ${
              view === "table"
                ? "bg-[#E94057] text-white"
                : "bg-white/50 text-[#6F6077] hover:bg-white/70"
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setView("map")}
            className={`px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all ${
              view === "map"
                ? "bg-[#E94057] text-white"
                : "bg-white/50 text-[#6F6077] hover:bg-white/70"
            }`}
          >
            Map
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <label className="text-sm font-medium text-[#6F6077] whitespace-nowrap">Filter by Country:</label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="flex-1 max-w-xs rounded-xl border border-white/60 bg-white/70 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E94057]"
          >
            <option value="">All Countries</option>
            {uniqueCountries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          <div className="text-sm text-[#6F6077] whitespace-nowrap">
            Total: <span className="font-semibold text-[#2A1F2D]">{data.total}</span> users
          </div>
        </div>
      </div>

      {view === "table" ? (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/50 border-b border-white/60">
                <tr>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-[#6F6077] uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-[#6F6077] uppercase tracking-wider">
                    City
                  </th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-[#6F6077] uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-[#6F6077] uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/60">
                {data.locationStats
                  .sort((a, b) => b.count - a.count)
                  .map((stat, idx) => (
                    <tr key={idx} className="hover:bg-white/30 transition-colors">
                      <td className="px-3 md:px-6 py-3 md:py-4 font-medium text-[#2A1F2D] text-sm md:text-base">{stat.country}</td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-[#6F6077] text-sm md:text-base">{stat.city}</td>
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <span className="font-semibold text-[#E94057] text-sm md:text-base">{stat.count}</span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-white/50 rounded-full overflow-hidden min-w-[60px]">
                            <div
                              className="h-full bg-gradient-to-r from-[#E94057] to-[#FF7EB3]"
                              style={{
                                width: `${(stat.count / data.total) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs md:text-sm text-[#6F6077] min-w-[45px] md:min-w-[50px] text-right">
                            {((stat.count / data.total) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div
            ref={mapRef}
            className="w-full h-[400px] md:h-[600px] rounded-2xl"
            style={{ minHeight: "400px" }}
          />
        </div>
      )}

      {/* Top Locations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {data.locationStats
          .sort((a, b) => b.count - a.count)
          .slice(0, 3)
          .map((stat, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl md:text-3xl">📍</span>
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-gradient-to-br from-[#E94057] to-[#FF7EB3] opacity-20" />
              </div>
              <h3 className="text-xs md:text-sm font-medium text-[#6F6077] mb-1">
                #{idx + 1} Location
              </h3>
              <p className="text-lg md:text-xl font-bold text-[#2A1F2D]">
                {stat.city}, {stat.country}
              </p>
              <p className="text-xs md:text-sm text-[#6F6077] mt-1">{stat.count} users</p>
            </div>
          ))}
      </div>
    </div>
  );
}
