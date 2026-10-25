export type DietaryStatus = 'standard' | 'dietary' | 'allergen_alert';
export type MealCategory = 'veg' | 'non_veg' | 'special';
export type UserRole = 'crew' | 'passenger';

export type PassengerSeat = {
  pnr: string;
  seatNumber: string;
  passengerName: string;
  mealType: string;
  mealCategory?: MealCategory;
  status: DietaryStatus;
  allergens: string[];
  notes?: string;
  served: boolean;
};
