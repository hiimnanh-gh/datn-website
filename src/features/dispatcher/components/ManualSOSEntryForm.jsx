import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  Search,
  MapPin,
  X,
  AlertOctagon,
  Heart,
  User,
  Phone,
  Check,
} from "lucide-react";

// Fix leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Mock Searchable Locations in HCMC
const MOCK_LOCATIONS = [
  { name: "Chợ Bến Thành, Quận 1", pos: [10.772, 106.698] },
  { name: "Công viên Tao Đàn, Quận 1", pos: [10.775, 106.692] },
  { name: "Nhà thờ Đức Bà, Quận 1", pos: [10.779, 106.698] },
  { name: "Bệnh viện Chợ Rẫy, Quận 5", pos: [10.757, 106.66] },
  { name: "Landmark 81, Bình Thạnh", pos: [10.795, 106.722] },
  { name: "Cư xá Thanh Đa, Bình Thạnh", pos: [10.803, 106.718] },
];

// Click event handler inside MapContainer
const MapClickHandler = ({ onClick }) => {
  useMapEvents({
    click(e) {
      onClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

// Component to dynamically fly the map viewport
const MapController = ({ center }) => {
  const map = useMapEvents({});
  React.useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

const ManualSOSEntryForm = ({ onSubmit, onClose }) => {
  const [callerName, setCallerName] = useState("");
  const [phone, setPhone] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationText, setLocationText] = useState("Select on Map or Search");
  const [coords, setCoords] = useState([10.776, 106.695]); // Default HCMC center
  const [severity, setSeverity] = useState("STANDARD");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  // Handle map click location select
  const handleMapClick = (latlng) => {
    setCoords(latlng);
    setLocationText(
      `Custom Pin Location: [${latlng[0].toFixed(5)}, ${latlng[1].toFixed(5)}]`,
    );
  };

  // Handle mock location search
  const handleSearch = (e) => {
    e.preventDefault();
    const found = MOCK_LOCATIONS.find((loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    if (found) {
      setCoords(found.pos);
      setLocationText(found.name);
      setError("");
    } else {
      setError(
        "Location not found in local HCMC GIS database. Click on map to place custom pin.",
      );
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (
      !callerName.trim() ||
      !phone.trim() ||
      locationText === "Select on Map or Search"
    ) {
      setError(
        "Please fill in Caller Name, Phone, and choose a valid Location.",
      );
      return;
    }

    const payload = {
      callerName,
      callerPhone: phone,
      victimName: callerName,
      victimPhone: phone,
      victimAddress: locationText,
      victimConditions: notes || "None specified",
      priority: severity,
      pos: coords,
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl animate-scale-in text-left flex flex-col md:flex-row h-[90vh] md:h-[650px] font-sans">
        {/* Left Side: Form Fields */}
        <form
          onSubmit={handleFormSubmit}
          className="flex-1 p-6 flex flex-col justify-between overflow-y-auto space-y-4"
        >
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="text-lg font-bold font-mono tracking-wider text-white flex items-center gap-2">
              <AlertOctagon className="text-red-500 animate-pulse" size={22} />
              MANUAL SOS INTAKE TICKET
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-all md:hidden"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-3.5">
            {error && (
              <div className="p-3 bg-red-950/50 border border-red-900 text-red-400 text-xs rounded-lg flex items-center gap-2">
                <AlertOctagon size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Caller Name */}
            <div>
              <label className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Caller Full Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  size={16}
                />
                <input
                  type="text"
                  required
                  placeholder="e.g. Nguyễn Văn A"
                  value={callerName}
                  onChange={(e) => setCallerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-blue-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  size={16}
                />
                <input
                  type="tel"
                  required
                  placeholder="e.g. +84 901234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-blue-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Location Display */}
            <div>
              <label className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Incident Address / Coordinates
              </label>
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg text-xs font-mono flex items-center gap-2 text-slate-300">
                <MapPin className="text-emerald-400" size={16} />
                <span className="truncate">{locationText}</span>
              </div>
            </div>

            {/* Severity level radio */}
            <div>
              <label className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider block mb-2">
                Severity Classification
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    value: "CRITICAL",
                    label: "Critical (Red)",
                    color: "border-red-600 text-red-500 bg-red-950/20",
                  },
                  {
                    value: "URGENT",
                    label: "Urgent (Orange)",
                    color: "border-orange-500 text-orange-500 bg-orange-950/20",
                  },
                  {
                    value: "STANDARD",
                    label: "Standard (Gray)",
                    color: "border-slate-700 text-slate-400 bg-slate-900/50",
                  },
                ].map((s) => {
                  const active = severity === s.value;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setSeverity(s.value)}
                      className={`border-2 py-2 text-[10px] font-bold font-mono rounded-lg transition-all ${
                        active
                          ? s.color + " scale-102 ring-1 ring-offset-slate-900"
                          : "border-slate-800 text-slate-500 hover:border-slate-750"
                      }`}
                    >
                      {s.value}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Medical Notes */}
            <div>
              <label className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Medical Assessment Notes
              </label>
              <textarea
                rows={3}
                placeholder="Describe victim conditions, breathing rate, consciousness level, injuries..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg p-3 outline-none focus:border-blue-500 transition-all resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold py-2.5 rounded-xl text-xs uppercase transition-all active:scale-95 text-center font-mono border border-slate-850"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase transition-all active:scale-95 flex items-center justify-center gap-1.5 font-mono shadow-lg shadow-blue-900/35"
            >
              <Check size={16} />
              Create SOS Ticket
            </button>
          </div>
        </form>

        {/* Right Side: Searchable Leaflet Map Input */}
        <div className="flex-1 bg-slate-950 relative flex flex-col border-t border-slate-800 md:border-t-0 md:border-l border-slate-800">
          {/* Map Search input */}
          <div className="absolute top-4 left-4 right-4 z-[1000] flex gap-2">
            <form
              onSubmit={handleSearch}
              className="flex-1 flex gap-2 bg-slate-900/90 border border-slate-850 p-1.5 rounded-xl shadow-2xl backdrop-blur-sm"
            >
              <input
                type="text"
                placeholder="Search HCMC (e.g. Bến Thành, Landmark 81)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs text-slate-200 outline-none w-full px-2"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-755 text-white p-2 rounded-lg transition-all shrink-0"
              >
                <Search size={14} />
              </button>
            </form>

            <button
              type="button"
              onClick={onClose}
              className="bg-slate-900/90 border border-slate-850 text-slate-400 hover:text-white p-2 rounded-xl transition-all shrink-0 hidden md:block backdrop-blur-sm"
            >
              <X size={16} />
            </button>
          </div>

          <MapContainer
            center={coords}
            zoom={14}
            className="w-full h-full z-0"
            zoomControl={false}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap"
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <Marker position={coords}>
              <Popup>Selected Incident Location</Popup>
            </Marker>
            <MapClickHandler onClick={handleMapClick} />
            <MapController center={coords} />
          </MapContainer>

          <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 border border-slate-850 p-2.5 rounded-lg text-[9px] font-mono text-slate-500 select-none z-[1000] backdrop-blur-sm text-center">
            *CLICK ANYWHERE ON MAP TO PLACE EMERGENCY GPS PIN
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualSOSEntryForm;
