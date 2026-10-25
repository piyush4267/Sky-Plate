import React from 'react';
import type { PassengerSeat } from '../types/flight';
import { X, ShieldAlert, Check, MessageSquareText } from 'lucide-react';

interface SeatModalProps {
  seat: PassengerSeat | null;
  onClose: () => void;
  onToggleServed: (seatNumber: string) => void;
}

export const SeatModal: React.FC<SeatModalProps> = ({ seat, onClose, onToggleServed }) => {
  if (!seat) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md p-6 text-white shadow-2xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-sky-400 font-bold">In-Cabin Service</span>
            <h3 className="text-2xl font-black">{seat.seatNumber} — {seat.passengerName}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {seat.allergens.length > 0 && (
          <div className="bg-red-500/15 border border-red-500/40 rounded-xl p-3 mb-4 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-red-400 uppercase">Critical Allergen Warning</p>
              <p className="text-sm font-semibold text-red-100">{seat.allergens.join(', ')}</p>
            </div>
          </div>
        )}

        <div className="space-y-2 mb-4 text-sm">
          <div className="flex justify-between py-1.5 border-b border-zinc-800">
            <span className="text-zinc-400">Meal Preference:</span>
            <span className="font-semibold text-zinc-100">{seat.mealType}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-zinc-800">
            <span className="text-zinc-400">Service Status:</span>
            <span className={seat.served ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
              {seat.served ? "Delivered" : "Pending Service"}
            </span>
          </div>
        </div>

        {/* Passenger Special Instructions / Notes */}
        {seat.notes && seat.notes.trim() !== '' && (
          <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-3 mb-5 flex items-start gap-3">
            <MessageSquareText className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                Passenger Instructions
              </p>
              <p className="text-xs text-zinc-200 mt-0.5 font-medium leading-snug">
                "{seat.notes}"
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => {
            onToggleServed(seat.seatNumber);
            onClose();
          }}
          className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
            seat.served
              ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          <Check className="w-4 h-4" />
          {seat.served ? 'Mark as Not Served' : 'Confirm Meal Served'}
        </button>
      </div>
    </div>
  );
};