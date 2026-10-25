import React, { useState } from 'react';
import type { PassengerSeat } from '../types/flight';
import { AlertTriangle, CheckCircle2, Utensils, Search, Filter } from 'lucide-react';

interface SeatMapProps {
  seats: PassengerSeat[];
  onSelectSeat: (seat: PassengerSeat) => void;
}

export const SeatMap: React.FC<SeatMapProps> = ({ seats, onSelectSeat }) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'veg' | 'non_veg' | 'allergy'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Get distinct row numbers sorted ascending
  const rowNumbers = Array.from(
    new Set(seats.map((s) => s.seatNumber.replace(/[^0-9]/g, '')))
  ).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  const getSeat = (row: string, letter: string) =>
    seats.find((s) => s.seatNumber === `${row}${letter}`);

  const totalSeats = seats.length;
  
  const vegCount = seats.filter((s) => {
    const cat = s.mealCategory?.toLowerCase() || '';
    const type = s.mealType?.toLowerCase() || '';
    return cat === 'veg' || cat === 'special' || type.includes('veg') || type.includes('jain') || type.includes('gluten') || type.includes('diabetic') || type.includes('asian');
  }).length;

  const nonVegCount = seats.filter((s) => {
    const cat = s.mealCategory?.toLowerCase() || '';
    const type = s.mealType?.toLowerCase() || '';
    return cat === 'non_veg' || type.includes('chicken') || type.includes('beef') || type.includes('lamb') || type.includes('halal') || type.includes('standard');
  }).length;

  const allergyCount = seats.filter((s) => s.status === 'allergen_alert').length;

  const filteredSeats = seats.filter((seat) => {
    const matchesSearch =
      seat.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seat.seatNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seat.pnr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seat.mealType.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    const cat = seat.mealCategory?.toLowerCase() || '';
    const type = seat.mealType?.toLowerCase() || '';
    const isVeg = cat === 'veg' || cat === 'special' || type.includes('veg') || type.includes('jain') || type.includes('gluten') || type.includes('diabetic') || type.includes('asian');
    const isNonVeg = !isVeg;

    if (filterCategory === 'veg') return isVeg;
    if (filterCategory === 'non_veg') return isNonVeg;
    if (filterCategory === 'allergy') return seat.status === 'allergen_alert';
    return true;
  });

  const isSeatMatchingFilter = (seat?: PassengerSeat) => {
    if (!seat) return false;
    return filteredSeats.some((s) => s.seatNumber === seat.seatNumber);
  };

  const renderSeatCard = (row: string, letter: string) => {
    const seat = getSeat(row, letter);
    if (!seat) {
      return (
        <div className="flex-1 h-20 rounded-2xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-xs font-mono text-gray-400">
          {row}{letter}
        </div>
      );
    }

    const matchesFilter = isSeatMatchingFilter(seat);
    const isServed = seat.served;
    const isAllergy = seat.status === 'allergen_alert';
    const cat = seat.mealCategory?.toLowerCase() || '';
    const type = seat.mealType?.toLowerCase() || '';
    const isVeg = cat === 'veg' || cat === 'special' || type.includes('veg') || type.includes('jain') || type.includes('gluten') || type.includes('diabetic') || type.includes('asian');

    // Light Theme Mapping: Veg = Emerald, Non-Veg = Red, Allergy = Amber, Served = Gray
    let cardStyle = 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300 shadow-sm';

    if (isVeg) {
      cardStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 shadow-sm';
    }

    if (isAllergy) {
      cardStyle = 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse hover:bg-amber-100 shadow-md shadow-amber-500/10';
    }

    if (isServed) {
      cardStyle = 'bg-gray-100 text-gray-400 border-gray-200 opacity-60 grayscale shadow-none';
    }

    if (!matchesFilter && (searchQuery !== '' || filterCategory !== 'all')) {
      cardStyle += ' opacity-30 scale-95';
    }

    return (
      <button
        key={seat.seatNumber}
        onClick={() => onSelectSeat(seat)}
        className={`flex-1 h-20 rounded-2xl border flex flex-col justify-between transition-all cursor-pointer hover:scale-105 p-2 ${cardStyle}`}
      >
        <div className="w-full text-center">
          <span className="text-sm font-black tracking-wider font-mono">{seat.seatNumber}</span>
        </div>

        <div className="flex justify-center items-center my-0.5">
          {isServed ? (
            <CheckCircle2 className="w-4 h-4 text-gray-400" />
          ) : isAllergy ? (
            <AlertTriangle className="w-4 h-4 text-amber-600 animate-bounce" />
          ) : (
            <Utensils className="w-3.5 h-3.5" />
          )}
        </div>

        <div className="w-full text-center">
          <span className="text-[10px] font-bold truncate block">
            {isServed ? 'Served' : seat.mealType.split(' ')[0]}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="w-full max-w-5xl bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col items-center">
      
      {/* Top Header & Metrics / Filter Legend Bar */}
      <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-gray-900 tracking-wider">
              Flight AI-204 Cabin Manifest
            </h2>
            <span className="text-[11px] font-mono font-black bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {totalSeats} SEATS TOTAL
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Boeing 787-9 Dreamliner • Rows 10-18 (DEL → LHR)
          </p>
        </div>

        {/* Top Metric Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setFilterCategory(filterCategory === 'veg' ? 'all' : 'veg')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              filterCategory === 'veg'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${filterCategory === 'veg' ? 'bg-white' : 'bg-emerald-500'}`} />
            Veg: <span className="font-mono font-black">{vegCount}</span>
          </button>

          <button
            onClick={() => setFilterCategory(filterCategory === 'non_veg' ? 'all' : 'non_veg')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              filterCategory === 'non_veg'
                ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/20'
                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${filterCategory === 'non_veg' ? 'bg-white' : 'bg-red-500'}`} />
            Non-Veg: <span className="font-mono font-black">{nonVegCount}</span>
          </button>

          <button
            onClick={() => setFilterCategory(filterCategory === 'allergy' ? 'all' : 'allergy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              filterCategory === 'allergy'
                ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 animate-pulse'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${filterCategory === 'allergy' ? 'bg-white' : 'bg-amber-400'}`} />
            Allergen Alert: <span className="font-mono font-black">{allergyCount}</span>
          </button>

          <div className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold border border-gray-200">
            Total: <span className="font-mono font-black text-gray-800">{totalSeats}</span>
          </div>

          <button
            onClick={() => setFilterCategory('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              filterCategory !== 'all'
                ? 'bg-gray-800 text-white border-gray-800 shadow-md'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            {filterCategory === 'all' ? 'Filter' : 'Clear Filter'}
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="w-full max-w-md mb-6 relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search seat (e.g. 10B), passenger name, or PNR..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-50 border border-gray-300 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all shadow-sm"
        />
      </div>

      {/* Seat Map View matching Reference Layout [Row Number on Far Left, Wide Aisle between ABC and DEF] */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[760px] bg-gray-50 border border-gray-200 rounded-3xl p-6 flex flex-col items-center shadow-inner">
          
          {/* Column Header Labels */}
          <div className="w-full flex items-center text-[11px] font-mono font-bold text-gray-400 px-2 mb-4">
            <div className="w-8 text-center">#</div>
            <div className="flex-1 flex justify-around ml-2">
              <span>A</span>
              <span>B</span>
              <span>C</span>
            </div>
            {/* Wide Aisle Gap Header */}
            <div className="w-16 text-center text-[10px] tracking-widest text-gray-400 uppercase">
              AISLE
            </div>
            <div className="flex-1 flex justify-around">
              <span>D</span>
              <span>E</span>
              <span>F</span>
            </div>
          </div>

          {/* Rows List */}
          <div className="w-full space-y-3">
            {rowNumbers.map((row) => (
              <div key={row} className="flex items-center gap-4">
                
                {/* Row Number on the Far Left */}
                <div className="w-8 text-center text-xs font-mono font-black text-gray-400 shrink-0">
                  {row}
                </div>

                {/* Left Section (A, B, C) */}
                <div className="flex-1 flex gap-2">
                  {renderSeatCard(row, 'A')}
                  {renderSeatCard(row, 'B')}
                  {renderSeatCard(row, 'C')}
                </div>

                {/* Wide Center Aisle Gap (No middle box, just empty breathing room) */}
                <div className="w-16 shrink-0" />

                {/* Right Section (D, E, F) */}
                <div className="flex-1 flex gap-2">
                  {renderSeatCard(row, 'D')}
                  {renderSeatCard(row, 'E')}
                  {renderSeatCard(row, 'F')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};