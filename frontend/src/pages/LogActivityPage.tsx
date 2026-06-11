import React, { useState } from 'react';
import { Car, Zap, UtensilsCrossed, ShoppingBag, Plus, CheckCircle } from 'lucide-react';
import { useFootprintStore } from '../store/footprintStore';
import { useUIStore } from '../store/uiStore';
import type { EmissionCategory } from '../types';

const CATEGORIES = [
  { id: 'transportation' as EmissionCategory, label: 'Transport', icon: Car, color: 'blue' },
  { id: 'energy' as EmissionCategory, label: 'Energy', icon: Zap, color: 'amber' },
  { id: 'food' as EmissionCategory, label: 'Food', icon: UtensilsCrossed, color: 'emerald' },
  { id: 'shopping' as EmissionCategory, label: 'Shopping', icon: ShoppingBag, color: 'purple' },
];

const ACTIVITY_TYPES: Record<EmissionCategory, Array<{ value: string; label: string }>> = {
  transportation: [
    { value: 'car_petrol', label: 'Car (Petrol)' }, { value: 'car_diesel', label: 'Car (Diesel)' },
    { value: 'car_electric', label: 'Car (Electric)' }, { value: 'car_hybrid', label: 'Car (Hybrid)' },
    { value: 'bus', label: 'Bus' }, { value: 'train', label: 'Train' },
    { value: 'flight_domestic', label: 'Flight (Domestic)' }, { value: 'flight_international', label: 'Flight (Int\'l)' },
    { value: 'bicycle', label: 'Bicycle' }, { value: 'walking', label: 'Walking' }, { value: 'motorcycle', label: 'Motorcycle' },
  ],
  energy: [
    { value: 'electricity', label: 'Electricity' }, { value: 'natural_gas', label: 'Natural Gas' },
    { value: 'solar', label: 'Solar' }, { value: 'wind', label: 'Wind' }, { value: 'heating_oil', label: 'Heating Oil' },
  ],
  food: [
    { value: 'beef', label: 'Beef' }, { value: 'lamb', label: 'Lamb' }, { value: 'chicken', label: 'Chicken' },
    { value: 'pork', label: 'Pork' }, { value: 'fish', label: 'Fish' }, { value: 'dairy', label: 'Dairy' },
    { value: 'eggs', label: 'Eggs' }, { value: 'rice', label: 'Rice' }, { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' }, { value: 'plant_based', label: 'Plant-Based' },
  ],
  shopping: [
    { value: 'clothing', label: 'Clothing' }, { value: 'electronics', label: 'Electronics' },
    { value: 'furniture', label: 'Furniture' }, { value: 'general', label: 'General Goods' }, { value: 'books', label: 'Books' },
  ],
};

const UNITS: Record<EmissionCategory, string> = {
  transportation: 'km', energy: 'kWh', food: 'kg', shopping: 'items',
};

/** Activity logger page with category tabs and dynamic form */
export default function LogActivityPage(): React.ReactElement {
  const { logActivity, isLoading } = useFootprintStore();
  const { showToast } = useUIStore();
  const [category, setCategory] = useState<EmissionCategory>('transportation');
  const [activityType, setActivityType] = useState('car_petrol');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);

  const handleCategoryChange = (cat: EmissionCategory): void => {
    setCategory(cat);
    setActivityType(ACTIVITY_TYPES[cat][0].value);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!value || Number(value) <= 0) return;

    try {
      const record = await logActivity({
        category, activityType, value: Number(value), unit: UNITS[category], date, notes: notes || undefined,
      });
      showToast({ type: 'success', message: `Logged ${record.co2Equivalent.toFixed(1)} kg CO₂ from ${activityType.replace(/_/g, ' ')}` });
      setSuccess(true);
      setValue('');
      setNotes('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      showToast({ type: 'error', message: (err as Error).message || 'Failed to log activity' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Log Activity</h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">Record a carbon-emitting activity</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap" role="tablist" aria-label="Activity category">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = category === cat.id;
          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleCategoryChange(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' : 'bg-white dark:bg-dark-800 text-dark-600 dark:text-dark-400 hover:bg-dark-50 dark:hover:bg-dark-700 border border-dark-200 dark:border-dark-600'}`}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="glass-card space-y-5" aria-label="Log activity form">
        <div>
          <label htmlFor="activity-type" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Activity Type</label>
          <select id="activity-type" value={activityType} onChange={(e) => setActivityType(e.target.value)} className="input-field" required>
            {ACTIVITY_TYPES[category].map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="activity-value" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
              Value ({UNITS[category]})
            </label>
            <input id="activity-value" type="number" value={value} onChange={(e) => setValue(e.target.value)} className="input-field" placeholder="0" min="0" step="0.1" required />
          </div>
          <div>
            <label htmlFor="activity-date" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Date</label>
            <input id="activity-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field" required max={new Date().toISOString().split('T')[0]} />
          </div>
        </div>

        <div>
          <label htmlFor="activity-notes" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Notes (optional)</label>
          <textarea id="activity-notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field resize-none" rows={2} placeholder="Add any notes..." maxLength={500} />
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary w-full">
          {isLoading ? 'Logging...' : success ? (
            <><CheckCircle className="w-4 h-4" /> Logged Successfully!</>
          ) : (
            <><Plus className="w-4 h-4" /> Log Activity</>
          )}
        </button>
      </form>
    </div>
  );
}
