"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { DayPlan } from "@/types";
import { Utensils, Camera, MapPin, Star, Hotel } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

// Dynamically import react-leaflet components to avoid SSR issues
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";

interface MapSectionProps {
    days: DayPlan[];
    selectedDayId?: string | null;
}

// Inner component to handle automatic map bounds fitting and smooth flyTo
function MapBounds({ locations, L }: { locations: any[], L: any }) { 
    const map = useMap();
    const [hasInitialFlyTo, setHasInitialFlyTo] = useState(false);

    useEffect(() => {
        if (locations.length > 0 && L && map) {
            try {
                if (!hasInitialFlyTo && locations.length === 1) {
                    // Smooth flyTo for the first added point
                    map.flyTo([locations[0].lat, locations[0].lng], 14, {
                        duration: 2,
                        easeLinearity: 0.25
                    });
                    setHasInitialFlyTo(true);
                } else {
                    const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
                    map.fitBounds(bounds, { padding: [70, 70], maxZoom: 15 });
                }
            } catch (e) {
                console.error("Error fitting bounds", e);
            }
        }
    }, [locations, map, L, hasInitialFlyTo]);

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
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                {locationsToRender.map((loc, idx) => {
                    const getIcon = (tag?: string) => {
                        const t = tag?.toLowerCase();
                        if (t?.includes("food") || t?.includes("restaurante")) return <Utensils size={14} className="text-white" />;
                        if (t?.includes("photo") || t?.includes("foto")) return <Camera size={14} className="text-white" />;
                        if (t?.includes("hotel") || t?.includes("dormir")) return <Hotel size={14} className="text-white" />;
                        if (t?.includes("must")) return <Star size={14} className="text-white" />;
                        return <MapPin size={14} className="text-white" />;
                    };

                    // Dynamic Scaling based on zoom level logic
                    const zoom = useMap().getZoom();
                    const scale = zoom > 14 ? 1.2 : zoom < 10 ? 0.7 : 1;
                    const size = 24 * scale;

                    const iconHtml = renderToStaticMarkup(
                        <div className="relative group flex items-center justify-center transition-all duration-300" style={{ transform: `scale(${scale})` }}>
                            {/* Minimalism: Black/White sleek Apple-style dots */}
                            <div 
                                className="bg-obsidian text-white rounded-full border-2 border-white/90 shadow-2xl flex items-center justify-center relative z-10 transition-all group-hover:bg-accent-cobalt group-hover:border-white"
                                style={{ width: `${size}px`, height: `${size}px` }}
                            >
                                <div style={{ transform: `scale(${scale * 0.85})` }}>
                                    {getIcon(loc.tag)}
                                </div>
                            </div>
                            {/* Shadow leaf */}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-black/40 blur-[2px] rounded-full z-0 group-hover:opacity-0 transition-opacity"></div>
                        </div>
                    );

                    const customIcon = L.divIcon({
                        className: 'custom-pin-icon',
                        html: iconHtml,
                        iconSize: [size, size],
                        iconAnchor: [size/2, size],
                        popupAnchor: [0, -size]
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
