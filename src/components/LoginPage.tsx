import React, { useState } from 'react';
import type { PassengerSeat } from '../types/flight';
import { Key, User, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onCrewLogin: () => void;
  onPassengerLogin: (pnrOrSeat: string) => boolean;
  passengers: PassengerSeat[];
}

export const LoginPage: React.FC<LoginPageProps> = ({ onCrewLogin, onPassengerLogin }) => {
  const [crewPin, setCrewPin] = useState('');
  const [passengerInput, setPassengerInput] = useState('10B');
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Crew Login Submission
  const handleCrewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Hackathon demo PINs
    const allowedPins = ['777', '1234', '7879'];

    if (!crewPin || allowedPins.includes(crewPin)) {
      onCrewLogin();
    } else {
      setErrorMsg('Invalid Crew PIN. Use demo PIN: 777');
    }
  };

  // Handle Passenger Login Submission
  const handlePassengerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const query = passengerInput.trim();

    if (!query) {
      setErrorMsg('Please enter a PNR or Seat Number');
      return;
    }

    const success = onPassengerLogin(query);

    if (!success) {
      setErrorMsg('Seat/PNR not found. Try 10B or SK1044');
    }
  };

  return (
    <div className="w-full max-w-5xl flex flex-col items-center p-4">
      {/* SKYPLATE Brand Header */}
      <div className="flex flex-col items-center text-center mb-10">
        {/* Custom Logo Image placed directly above the badge */}
        <div className="w-20 h-20 rounded-3xl bg-white border-2 border-red-200/80 p-2.5 shadow-lg shadow-red-500/10 flex items-center justify-center mb-4 transition-transform hover:scale-105">
          <img src="/logo.png" alt="SkyPlate Logo" className="w-full h-full object-contain" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold mb-4">
         SKYPLATE Aviation Intelligence
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-wider mb-3">
          Welcome to SKYPLATE
        </h1>
        <p className="text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
          Real-time dietary synchronization, allergen safeguards, and zero-waste manifest tracking.
          Authorized for demo use DELHI-TOKYO.
        </p>
      </div>

      {/* Login Portal Cards (Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Left Card: Cabin Crew Access (Deep Crimson Theme) */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-gray-300 transition-all">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-6">
              <Key className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">Cabin Crew Access</h2>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              Full flight manifest, dietary status grid, allergy warnings, and service tracking.
              Unauthorized access prohibited.
            </p>

            <form onSubmit={handleCrewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Crew Security Passcode / PIN
                </label>
                <input
                  type="password"
                  placeholder="Enter PIN (e.g. 777)"
                  value={crewPin}
                  onChange={(e) => {
                    setCrewPin(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-700 focus:border-red-700 transition-colors font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-700/20 transition-all cursor-pointer pointer-events-auto"
              >
                <span>Login as Cabin Crew</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Demo PIN: <strong className="text-red-700 font-mono">777</strong></span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Secure Node L1-Bypass</span>
          </div>
        </div>

        {/* Right Card: Passenger Portal (Charcoal / Dark Slate Theme) */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-gray-300 transition-all">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-800 mb-6">
              <User className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">Passenger Portal</h2>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              Declare medical allergies, customize dietary preferences, and signal crew live mid-flight.
              Self-service passenger profile.
            </p>

            <form onSubmit={handlePassengerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Booking Reference (PNR) or Seat Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10B or SK1044"
                  value={passengerInput}
                  onChange={(e) => {
                    setPassengerInput(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-gray-800 uppercase transition-colors font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-gray-900/20 transition-all cursor-pointer pointer-events-auto mt-2"
              >
                <span>Access Passenger Hub</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Sample Seat: <strong className="text-gray-900 font-mono">10B</strong> (David Kim)</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Self-Service Zone R2</span>
          </div>
        </div>
      </div>

      {/* Centered Error Message Display */}
      {errorMsg && (
        <div className="mt-8 px-5 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold animate-pulse shadow-lg shadow-red-500/10">
          ⚠️ {errorMsg}
        </div>
      )}
    </div>
  );
};
