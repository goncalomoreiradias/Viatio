"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { DayPlan } from "@/types";

// Dynamically import react-leaflet components to avoid SSR issues
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";

interface MapSectionProps {
    days: DayPlan[];
    selectedDayId?: string | null;
}

// Inner component to handle automatic map bounds fitting
function MapBounds({ locations, L }: { locations: any[], L: any }) { 
    const map = useMap();

    useEffect(() => {
        if (locations.length > 0 && L && map) {
            try {
                const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
                map.fitBounds(bounds, { padding: [70, 70], maxZoom: 15 });
            } catch (e) {
                console.error("Error fitting bounds", e);
            }
        }
    }, [locations, map, L]);

    return null;
}

export default function MapSection({ days, selectedDayId }: MapSectionProps) {
    const [L, setL] = useState<any>(null);

    useEffect(() => {
        // Only import Leaflet on the client side
        import("leaflet").then(leaflet => {
            // Fix default icon issue with webpack/nextjs
            delete (leaflet.Icon.Default.prototype as any)._getIconUrl;

            leaflet.Icon.Default.mergeOptions({
                iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            });

            setL(leaflet);
        });
    }, []);

    if (!L) {
        return (
            <div className="w-full h-[300px] md:h-full bg-gray-100 dark:bg-gray-800/50 animate-pulse flex items-center justify-center rounded-2xl border border-gray-200 dark:border-gray-700">
                <span className="text-gray-400 font-medium tracking-tight">A carregar mapa...</span>
            </div>
        );
    }

    // Get locations for the selected day, or all locations if none selected
    const locationsToRender = selectedDayId
        ? days.find(d => d.id === selectedDayId)?.locations || []
        : days.flatMap(d => d.locations);

    // Default to Bali center if no locations
    const defaultCenter: [number, number] = [-8.409518, 115.188919];
    const initialCenter: [number, number] = locationsToRender.length > 0 
        ? [locationsToRender[0].lat, locationsToRender[0].lng] 
        : defaultCenter;

    return (
        <div className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden shadow-2xl z-0 relative border border-white/10 dark:border-white/5">
            <MapContainer
                center={initialCenter}
                zoom={selectedDayId ? 13 : 11}
                style={{ height: "100%", width: "100%", zIndex: 1 }}
                zoomControl={false}
                scrollWheelZoom={true}
            >
                <MapBounds locations={locationsToRender} L={L} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                {locationsToRender.map((loc, idx) => {
                    const customIcon = L.divIcon({
                        className: 'custom-pin-icon',
                        html: `
                            <div class="relative group">
                                <div class="w-8 h-8 bg-accent-cobalt rounded-full border-4 border-white shadow-[0_0_20px_rgba(46,91,255,0.6)] flex items-center justify-center relative z-10 animate-fade-in group-hover:scale-110 transition-transform">
                                    <div class="w-2.5 h-2.5 bg-white rounded-full"></div>
                                </div>
                                <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-accent-cobalt/40 blur-[4px] rounded-full z-0"></div>
                                <div class="absolute inset-0 w-full h-full bg-accent-cobalt/20 rounded-full blur-[15px] animate-pulse"></div>
                            </div>
                        `,
                        iconSize: [32, 40],
                        iconAnchor: [16, 32],
                        popupAnchor: [0, -32]
                    });

                    return (
                        <Marker 
                            key={`${loc.id}-${idx}`} 
                            position={[loc.lat, loc.lng]}
                            icon={customIcon}
                        >
                            <Popup className="premium-popup">
                                <div className="p-4 min-w-[200px] bg-obsidian border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-cobalt to-accent-indigo" />
                                    <h4 className="font-black text-white m-0 mb-2 font-outfit text-base tracking-tight leading-tight">{loc.name}</h4>
                                    <p className="text-xs text-gray-400 m-0 leading-relaxed line-clamp-3 font-medium">{loc.description}</p>
                                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                        <a
                                            href={loc.mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(loc.name)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent-cobalt hover:text-white transition-colors"
                                        >
                                            Ver no Maps →
                                        </a>
                                        <div className="px-2 py-1 bg-white/5 rounded-md text-[8px] font-black text-gray-500 uppercase tracking-widest">
                                            {loc.tag || 'Visit'}
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* Subtle overlay for branding */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_60px_rgba(0,0,0,0.2)] z-10" />
        </div>
    );
}
