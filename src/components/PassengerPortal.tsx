import React, { useState } from 'react';
import type { PassengerSeat } from '../types/flight';
import { HeartPulse, LogOut, Utensils, CheckCircle2, Ticket } from 'lucide-react';

interface PassengerPortalProps {
  passenger: PassengerSeat;
  onUpdate: (updated: PassengerSeat) => void;
  onLogout: () => void;
}

const COMMON_ALLERGENS = [
  'Peanuts',
  'Tree Nuts',
  'Shellfish',
  'Dairy / Lactose',
  'Gluten / Celiac',
  'Eggs',
  'Soy',
];

const MEAL_OPTIONS = [
  'Standard Chicken',
  'Standard Beef',
  'Standard Pasta',
  'Asian Vegetarian',
  'Gluten-Free Tray',
  'Halal Lamb',
  'Jain Meal',
  'Diabetic Friendly',
];

export const PassengerPortal: React.FC<PassengerPortalProps> = ({
  passenger,
  onUpdate,
  onLogout,
}) => {
  const [mealType, setMealType] = useState(passenger.mealType);
  const [allergens, setAllergens] = useState<string[]>(passenger.allergens || []);
  const [notes, setNotes] = useState(passenger.notes || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleAllergen = (item: string) => {
    setAllergens((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const hasAllergens = allergens.length > 0;
    const isSpecialDiet = mealType !== 'Standard Chicken' && mealType !== 'Standard Beef' && mealType !== 'Standard Pasta';

    const updated: PassengerSeat = {
      ...passenger,
      mealType,
      allergens,
      notes,
      status: hasAllergens ? 'allergen_alert' : isSpecialDiet ? 'dietary' : 'standard',
    };

    onUpdate(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xl">
      {/* Header with PNR Badge */}
      <div className="flex justify-between items-start pb-6 border-b border-gray-200 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] tracking-widest font-black uppercase text-red-700">
              Passenger Dietary Pass
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
              <Ticket className="w-3 h-3" /> PNR: {passenger.pnr}
            </span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mt-1">
            Seat {passenger.seatNumber} • {passenger.passengerName}
          </h2>
          <p className="text-xs text-gray-500 mt-1">Flight AI-204 • Boeing 787-9 Dreamliner (DEL → LHR)</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold cursor-pointer transition-all shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          Exit
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Meal Choice */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3">
            <Utensils className="w-4 h-4 text-gray-600" />
            Select In-Flight Entrée
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {MEAL_OPTIONS.map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => setMealType(option)}
                className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                  mealType === option
                    ? 'border-gray-900 bg-gray-900 text-white shadow-md'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Medical Allergens */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-1.5">
            <HeartPulse className="w-4 h-4 text-red-600" />
            Declare Medical Allergies & Cross-Contact Risks
          </label>
          <p className="text-[11px] text-gray-500 mb-3">
            Flagging allergens triggers an automated alert directly on the cabin crew manifest.
          </p>
          <div className="flex flex-wrap gap-2">
            {COMMON_ALLERGENS.map((allergy) => {
              const active = allergens.includes(allergy);
              return (
                <button
                  type="button"
                  key={allergy}
                  onClick={() => toggleAllergen(allergy)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'border-red-600 bg-red-50 text-red-700 shadow-sm'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {allergy}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes for Crew */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Special Instructions (if any)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Carries EpiPen in hand baggage; severe reaction to tree nuts."
            className="w-full bg-white border border-gray-300 rounded-xl p-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-gray-800 transition-colors shadow-sm"
          />
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            Dietary profile updated and synced with aircraft galley manifest!
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-sm transition-all cursor-pointer shadow-lg shadow-gray-900/20"
        >
          Confirm & Sync Dietary Profile
        </button>
      </form>
    </div>
  );
};