import { useState } from 'react';
import { SeatMap } from './components/SeatMap';
import { SeatModal } from './components/SeatModal';
import { LoginPage } from './components/LoginPage';
import { PassengerPortal } from './components/PassengerPortal';
import type { PassengerSeat, UserRole } from './types/flight';
import { Wifi, WifiOff, Sparkles, LogOut, Leaf } from 'lucide-react';
import logoImg from '/logo.png';

const INITIAL_SEATS: PassengerSeat[] = [
  // Row 10
  { pnr: 'SK1044', seatNumber: '10A', passengerName: 'Sarah Jenkins', mealType: 'Asian Vegetarian', status: 'dietary', allergens: [], served: false },
  { pnr: 'SK9821', seatNumber: '10B', passengerName: 'David Kim', mealType: 'Standard Chicken', status: 'allergen_alert', allergens: ['Severe Peanuts / Tree Nuts'], notes: 'Carries EpiPen', served: false },
  { pnr: 'SK4420', seatNumber: '10C', passengerName: 'Elena Rostova', mealType: 'Standard Pasta', status: 'standard', allergens: [], served: true },
  { pnr: 'SK7731', seatNumber: '10D', passengerName: 'Marcus Vance', mealType: 'Gluten-Free Tray', status: 'dietary', allergens: ['Gluten / Celiac'], served: false },
  { pnr: 'SK5512', seatNumber: '10E', passengerName: 'Aisha Al-Mansoor', mealType: 'Halal Lamb', status: 'dietary', allergens: [], served: false },
  { pnr: 'SK8819', seatNumber: '10F', passengerName: 'Liam O’Connor', mealType: 'Standard Chicken', status: 'allergen_alert', allergens: ['Shellfish'], served: false },

  // Row 11
  { pnr: 'SK3390', seatNumber: '11A', passengerName: 'Priya Sharma', mealType: 'Jain Meal', status: 'dietary', allergens: ['No Root Veg'], served: false },
  { pnr: 'SK6624', seatNumber: '11B', passengerName: 'Oliver Smith', mealType: 'Standard Beef', status: 'standard', allergens: [], served: false },
  { pnr: 'SK2281', seatNumber: '11C', passengerName: 'Chloe Bennett', mealType: 'Standard Pasta', status: 'standard', allergens: [], served: false },
  { pnr: 'SK9915', seatNumber: '11D', passengerName: 'Kenji Sato', mealType: 'Diabetic Friendly', status: 'dietary', allergens: [], served: true },
  { pnr: 'SK8802', seatNumber: '11E', passengerName: 'Fatima Zahra', mealType: 'Halal Chicken', status: 'dietary', allergens: [], served: false },
  { pnr: 'SK1149', seatNumber: '11F', passengerName: 'Lucas Silva', mealType: 'Standard Beef', status: 'standard', allergens: [], served: false },

  // Row 12
  { pnr: 'SK5011', seatNumber: '12A', passengerName: 'Arjun Mehta', mealType: 'Asian Vegetarian', status: 'dietary', allergens: [], served: false },
  { pnr: 'SK5012', seatNumber: '12B', passengerName: 'Sophia Muller', mealType: 'Standard Chicken', status: 'allergen_alert', allergens: ['Dairy / Lactose'], served: false },
  { pnr: 'SK5013', seatNumber: '12C', passengerName: 'Carlos Gomez', mealType: 'Standard Beef', status: 'standard', allergens: [], served: false },
  { pnr: 'SK5014', seatNumber: '12D', passengerName: 'Mei Ling', mealType: 'Gluten-Free Tray', status: 'dietary', allergens: ['Soy Beans'], served: false },
  { pnr: 'SK5015', seatNumber: '12E', passengerName: 'Tariq Hassan', mealType: 'Halal Lamb', status: 'dietary', allergens: [], served: false },
  { pnr: 'SK5016', seatNumber: '12F', passengerName: 'Emma Watson', mealType: 'Standard Pasta', status: 'standard', allergens: [], served: true },

  // Row 13
  { pnr: 'SK6011', seatNumber: '13A', passengerName: 'Rohan Gupta', mealType: 'Jain Meal', status: 'dietary', allergens: [], served: false },
  { pnr: 'SK6012', seatNumber: '13B', passengerName: 'Hannah Abbott', mealType: 'Standard Chicken', status: 'allergen_alert', allergens: ['Severe Peanuts'], notes: 'Galley peanut buffer requested', served: false },
  { pnr: 'SK6013', seatNumber: '13C', passengerName: 'Lars Nielsen', mealType: 'Standard Beef', status: 'standard', allergens: [], served: false },
  { pnr: 'SK6014', seatNumber: '13D', passengerName: 'Amira Khan', mealType: 'Halal Chicken', status: 'dietary', allergens: [], served: false },
  { pnr: 'SK6015', seatNumber: '13E', passengerName: 'Dmitri Volkov', mealType: 'Standard Pasta', status: 'standard', allergens: [], served: false },
  { pnr: 'SK6016', seatNumber: '13F', passengerName: 'Grace Hopper', mealType: 'Diabetic Friendly', status: 'dietary', allergens: [], served: true },

  // Row 14
  { pnr: 'SK7011', seatNumber: '14A', passengerName: 'Vikram Rao', mealType: 'Asian Vegetarian', status: 'dietary', allergens: [], served: false },
  { pnr: 'SK7012', seatNumber: '14B', passengerName: 'Zoe Kravitz', mealType: 'Standard Beef', status: 'standard', allergens: [], served: false },
  { pnr: 'SK7013', seatNumber: '14C', passengerName: 'Mateo Rossi', mealType: 'Standard Pasta', status: 'allergen_alert', allergens: ['Eggs'], served: false },
  { pnr: 'SK7014', seatNumber: '14D', passengerName: 'Ananya Roy', mealType: 'Gluten-Free Tray', status: 'dietary', allergens: ['Celiac Disease'], served: false },
  { pnr: 'SK7015', seatNumber: '14E', passengerName: 'Sven Lindqvist', mealType: 'Standard Chicken', status: 'standard', allergens: [], served: false },
  { pnr: 'SK7016', seatNumber: '14F', passengerName: 'Yuki Tanaka', mealType: 'Standard Beef', status: 'standard', allergens: [], served: false },

  // Row 15
  { pnr: 'SK8011', seatNumber: '15A', passengerName: 'Kabir Das', mealType: 'Jain Meal', status: 'dietary', allergens: ['No Onions / Garlic'], served: false },
  { pnr: 'SK8012', seatNumber: '15B', passengerName: 'Isabella Cruz', mealType: 'Standard Chicken', status: 'allergen_alert', allergens: ['Shellfish', 'Crustaceans'], served: false },
  { pnr: 'SK8013', seatNumber: '15C', passengerName: 'Noah Schneider', mealType: 'Standard Pasta', status: 'standard', allergens: [], served: false },
  { pnr: 'SK8014', seatNumber: '15D', passengerName: 'Zainab Qureshi', mealType: 'Halal Lamb', status: 'dietary', allergens: [], served: false },
  { pnr: 'SK8015', seatNumber: '15E', passengerName: 'Arthur Dent', mealType: 'Standard Beef', status: 'standard', allergens: [], served: true },
  { pnr: 'SK8016', seatNumber: '15F', passengerName: 'Clara Oswald', mealType: 'Standard Pasta', status: 'standard', allergens: [], served: false },

  // Row 16
  { pnr: 'SK9011', seatNumber: '16A', passengerName: 'Deepak Chopra', mealType: 'Asian Vegetarian', status: 'dietary', allergens: [], served: false },
  { pnr: 'SK9012', seatNumber: '16B', passengerName: 'Rachel Green', mealType: 'Diabetic Friendly', status: 'dietary', allergens: [], served: false },
  { pnr: 'SK9013', seatNumber: '16C', passengerName: 'Chandler Bing', mealType: 'Standard Chicken', status: 'standard', allergens: [], served: false },
  { pnr: 'SK9014', seatNumber: '16D', passengerName: 'Monica Geller', mealType: 'Gluten-Free Tray', status: 'allergen_alert', allergens: ['Cross-Contamination Gluten'], served: false },
  { pnr: 'SK9015', seatNumber: '16E', passengerName: 'Joey Tribbiani', mealType: 'Standard Beef', status: 'standard', allergens: [], served: true },
  { pnr: 'SK9016', seatNumber: '16F', passengerName: 'Phoebe Buffay', mealType: 'Asian Vegetarian', status: 'dietary', allergens: [], served: false },

  // Row 17
  { pnr: 'SK9111', seatNumber: '17A', passengerName: 'Dev Patel', mealType: 'Asian Vegetarian', status: 'dietary', allergens: [], served: false },
  { pnr: 'SK9112', seatNumber: '17B', passengerName: 'Nadia Boulanger', mealType: 'Standard Pasta', status: 'allergen_alert', allergens: ['Tree Nuts', 'Cashews'], served: false },
  { pnr: 'SK9113', seatNumber: '17C', passengerName: 'Felix Baum', mealType: 'Standard Chicken', status: 'standard', allergens: [], served: false },
  { pnr: 'SK9114', seatNumber: '17D', passengerName: 'Farhan Akhtar', mealType: 'Halal Chicken', status: 'dietary', allergens: [], served: false },
  { pnr: 'SK9115', seatNumber: '17E', passengerName: 'Mia Thorne', mealType: 'Standard Beef', status: 'standard', allergens: [], served: false },
  { pnr: 'SK9116', seatNumber: '17F', passengerName: 'Hans Zimmer', mealType: 'Standard Pasta', status: 'standard', allergens: [], served: true },

  // Row 18
  { pnr: 'SK9211', seatNumber: '18A', passengerName: 'Tanvi Verma', mealType: 'Jain Meal', status: 'dietary', allergens: [], served: false },
  { pnr: 'SK9212', seatNumber: '18B', passengerName: 'Ethan Hunt', mealType: 'Standard Beef', status: 'standard', allergens: [], served: false },
  { pnr: 'SK9213', seatNumber: '18C', passengerName: 'Ilsa Faust', mealType: 'Standard Chicken', status: 'allergen_alert', allergens: ['Sesame Seeds'], served: false },
  { pnr: 'SK9214', seatNumber: '18D', passengerName: 'Benji Dunn', mealType: 'Gluten-Free Tray', status: 'dietary', allergens: [], served: false },
  { pnr: 'SK9215', seatNumber: '18E', passengerName: 'Luther Stickell', mealType: 'Halal Lamb', status: 'dietary', allergens: [], served: false },
  { pnr: 'SK9216', seatNumber: '18F', passengerName: 'Alanna Mitsopolis', mealType: 'Standard Pasta', status: 'standard', allergens: [], served: false },
];

export default function App() {
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);
  const [activePassengerPnr, setActivePassengerPnr] = useState<string | null>(null);
  const [seats, setSeats] = useState<PassengerSeat[]>(INITIAL_SEATS);
  const [selectedSeat, setSelectedSeat] = useState<PassengerSeat | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showEcoModal, setShowEcoModal] = useState<boolean>(false);

  const handleCrewLogin = () => {
    setCurrentUserRole('crew');
  };

  const handlePassengerLogin = (query: string): boolean => {
    const cleanQuery = query.trim().toUpperCase();
    const match = seats.find(
      (s) => s.pnr.toUpperCase() === cleanQuery || s.seatNumber.toUpperCase() === cleanQuery
    );

    if (match) {
      setActivePassengerPnr(match.pnr);
      setCurrentUserRole('passenger');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUserRole(null);
    setActivePassengerPnr(null);
  };

  const handlePassengerUpdate = (updatedSeat: PassengerSeat) => {
    setSeats((prev) =>
      prev.map((s) => (s.pnr === updatedSeat.pnr ? updatedSeat : s))
    );
  };

  const toggleServed = (seatNumber: string) => {
    setSeats((prev) =>
      prev.map((s) => (s.seatNumber === seatNumber ? { ...s, served: !s.served } : s))
    );
  };

  // 1. Role / Login Screen
  if (!currentUserRole) {
    return (
      <div className="min-h-screen bg-[#F4F4F4] text-gray-900 flex items-center justify-center p-4 sm:p-6">
        <LoginPage
          onCrewLogin={handleCrewLogin}
          onPassengerLogin={handlePassengerLogin}
          passengers={seats}
        />
      </div>
    );
  }

  // 2. Passenger Portal Screen
  if (currentUserRole === 'passenger' && activePassengerPnr) {
    const currentPassenger = seats.find((s) => s.pnr === activePassengerPnr) || seats[0];

    return (
      <div className="min-h-screen bg-[#F4F4F4] text-gray-900 flex items-center justify-center p-4 sm:p-6">
        
        <PassengerPortal
          passenger={currentPassenger}
          onUpdate={handlePassengerUpdate}
          onLogout={handleLogout}
        />
      </div>
    );
  }

  // 3. Cabin Crew View (Full 54-Seat Manifest)
  return (
    <div className="min-h-screen bg-[#F4F4F4] text-gray-900 flex flex-col items-center justify-start py-8 px-4 sm:px-6">
      {/* Top Navigation Bar */}
      <div className="w-full max-w-5xl flex flex-wrap justify-between items-center gap-4 mb-6 px-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl overflow-hidden border border-red-200 shrink-0 bg-white shadow-sm flex items-center justify-center">
            <img src="/logo.png" alt="SkyPlate Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-wider text-gray-900">SKYPLATE</h1>
              <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-bold">
                CREW CONSOLE
              </span>
            </div>
            <p className="text-[11px] text-gray-600 font-medium">
              Flight AI-204 • 54 Total Passenger Manifest
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all ${
              isOnline
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-orange-50 border-orange-200 text-orange-700'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 animate-pulse" />
                <span>Online (WebSocket Synced)</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline (IndexedDB Isolated)</span>
              </>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold cursor-pointer transition-all shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            Switch Role
          </button>
        </div>
      </div>

      {/* 54-Seat Aircraft Manifest Component */}
      <SeatMap seats={seats} onSelectSeat={setSelectedSeat} />

      {/* Interactive In-Cabin Service Modal */}
      <SeatModal
        seat={selectedSeat}
        onClose={() => setSelectedSeat(null)}
        onToggleServed={toggleServed}
      />

      {/* Sustainability Impact Callout */}
      <button
        onClick={() => setShowEcoModal(true)}
        className="mt-6 flex items-center gap-2 text-xs text-gray-600 hover:text-red-700 transition-colors cursor-pointer pb-4"
      >
        <Sparkles className="w-4 h-4 text-red-600" />
        <span>Predictive Demand Optimization active: 22% estimated waste reduction. (Click for Sector Analytics)</span>
      </button>

      {/* Sector Efficiency Metrics Modal */}
      {showEcoModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-md p-6 text-gray-900 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-lg">Sector Efficiency Metrics</h3>
              </div>
              <button
                onClick={() => setShowEcoModal(false)}
                className="text-xs text-gray-500 hover:text-gray-900 cursor-pointer px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <p className="text-[10px] text-gray-500 font-bold uppercase">Weight Reduced</p>
                <p className="text-xl font-black text-blue-600 mt-1">184 kg</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Reduced buffer deadweight</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <p className="text-[10px] text-gray-500 font-bold uppercase">Fuel Burn Avoided</p>
                <p className="text-xl font-black text-emerald-600 mt-1">55.2 kg</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Per flight sector</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <p className="text-[10px] text-gray-500 font-bold uppercase">CO₂ Abated</p>
                <p className="text-xl font-black text-teal-600 mt-1">173.8 kg</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Emission credits saved</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <p className="text-[10px] text-gray-500 font-bold uppercase">Waste Diverted</p>
                <p className="text-xl font-black text-orange-600 mt-1">42 Trays</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Prevented incinerator waste</p>
              </div>
            </div>

            <p className="text-[11px] text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-200">
              Generated by scikit-learn quantile regression against historical DEL-LHR passenger appetite curves.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
