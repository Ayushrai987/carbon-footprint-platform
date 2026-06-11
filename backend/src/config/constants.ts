/**
 * @module config/constants
 * @description Application constants including emission factors, default recommendations,
 * achievement badges, and community challenges.
 * All emission factors are in kg CO2 per unit (km, kWh, kg, or currency unit).
 */

import { EmissionCategory, Recommendation, Badge, Challenge } from '../types';

/** CO2 emission factors organized by category and activity type (kg CO2 per unit) */
export const EMISSION_FACTORS: Record<EmissionCategory, Record<string, number>> = {
  transportation: {
    car_petrol: 0.21,
    car_diesel: 0.27,
    car_electric: 0.05,
    car_hybrid: 0.12,
    bus: 0.089,
    train: 0.041,
    flight_domestic: 0.255,
    flight_international: 0.195,
    bicycle: 0,
    walking: 0,
    motorcycle: 0.113,
  },
  energy: {
    electricity: 0.4,
    natural_gas: 2.0,
    solar: 0.05,
    wind: 0.01,
    heating_oil: 2.52,
  },
  food: {
    beef: 27,
    lamb: 39.2,
    chicken: 6.9,
    pork: 12.1,
    fish: 6.1,
    dairy: 3.2,
    eggs: 4.8,
    rice: 2.7,
    vegetables: 2.0,
    fruits: 1.1,
    plant_based: 2.0,
  },
  shopping: {
    clothing: 15,
    electronics: 50,
    furniture: 30,
    general: 10,
    books: 2.5,
  },
};

/** Units expected for each category */
export const CATEGORY_UNITS: Record<EmissionCategory, string[]> = {
  transportation: ['km', 'miles'],
  energy: ['kWh', 'therms'],
  food: ['kg', 'lbs', 'servings'],
  shopping: ['items', 'usd', 'eur'],
};

/** Default recommendations for reducing carbon footprint */
export const DEFAULT_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 1,
    category: 'transportation',
    action: 'Switch to public transit for daily commute',
    impact: 120,
    difficulty: 'medium',
    priority: 1,
    description:
      'Using public transit instead of driving a petrol car can save up to 120 kg CO2 per month for a typical 20 km commute.',
  },
  {
    id: 2,
    category: 'transportation',
    action: 'Bike or walk for trips under 5 km',
    impact: 45,
    difficulty: 'easy',
    priority: 2,
    description:
      'Short car trips are the most carbon-intensive per km. Walking or cycling eliminates these emissions entirely.',
  },
  {
    id: 3,
    category: 'transportation',
    action: 'Carpool with colleagues',
    impact: 80,
    difficulty: 'easy',
    priority: 3,
    description:
      'Sharing rides with 2-3 colleagues cuts your per-person transport emissions by 50-66%.',
  },
  {
    id: 4,
    category: 'transportation',
    action: 'Consider an electric or hybrid vehicle',
    impact: 150,
    difficulty: 'hard',
    priority: 4,
    description:
      'Electric vehicles produce 50-75% less CO2 than petrol cars over their lifetime.',
  },
  {
    id: 5,
    category: 'transportation',
    action: 'Take trains instead of domestic flights',
    impact: 200,
    difficulty: 'medium',
    priority: 5,
    description:
      'Trains emit about 6x less CO2 than domestic flights for equivalent distances.',
  },
  {
    id: 6,
    category: 'energy',
    action: 'Switch to LED light bulbs',
    impact: 20,
    difficulty: 'easy',
    priority: 1,
    description:
      'LEDs use 75% less energy than incandescent bulbs and last 25 times longer.',
  },
  {
    id: 7,
    category: 'energy',
    action: 'Install a smart thermostat',
    impact: 40,
    difficulty: 'medium',
    priority: 2,
    description:
      'Smart thermostats can reduce heating and cooling energy use by 10-15% by optimizing schedules.',
  },
  {
    id: 8,
    category: 'energy',
    action: 'Unplug devices when not in use',
    impact: 15,
    difficulty: 'easy',
    priority: 3,
    description:
      'Phantom loads from plugged-in devices can account for 5-10% of your electricity bill.',
  },
  {
    id: 9,
    category: 'energy',
    action: 'Switch to a renewable energy provider',
    impact: 200,
    difficulty: 'medium',
    priority: 4,
    description:
      'Switching to 100% renewable electricity can eliminate most of your energy-related emissions.',
  },
  {
    id: 10,
    category: 'energy',
    action: 'Improve home insulation',
    impact: 100,
    difficulty: 'hard',
    priority: 5,
    description:
      'Better insulation reduces heating and cooling needs by 20-30%, saving both energy and money.',
  },
  {
    id: 11,
    category: 'food',
    action: 'Have one meat-free day per week',
    impact: 30,
    difficulty: 'easy',
    priority: 1,
    description:
      'Replacing meat with plant-based meals one day per week can save about 30 kg CO2 per month.',
  },
  {
    id: 12,
    category: 'food',
    action: 'Reduce beef consumption by 50%',
    impact: 60,
    difficulty: 'medium',
    priority: 2,
    description:
      'Beef has the highest carbon footprint of any common food. Cutting it in half makes a significant impact.',
  },
  {
    id: 13,
    category: 'food',
    action: 'Buy local and seasonal produce',
    impact: 25,
    difficulty: 'easy',
    priority: 3,
    description:
      'Locally sourced food has lower transport emissions. Seasonal produce avoids energy-intensive greenhouses.',
  },
  {
    id: 14,
    category: 'food',
    action: 'Reduce food waste',
    impact: 35,
    difficulty: 'easy',
    priority: 4,
    description:
      'About 30% of food is wasted. Planning meals and using leftovers prevents unnecessary emissions.',
  },
  {
    id: 15,
    category: 'food',
    action: 'Switch from dairy to plant-based milk',
    impact: 20,
    difficulty: 'easy',
    priority: 5,
    description:
      'Plant-based milks produce 50-80% less CO2 than dairy milk on average.',
  },
  {
    id: 16,
    category: 'shopping',
    action: 'Buy second-hand clothing',
    impact: 25,
    difficulty: 'easy',
    priority: 1,
    description:
      'Second-hand clothing eliminates manufacturing emissions and extends product lifecycle.',
  },
  {
    id: 17,
    category: 'shopping',
    action: 'Repair electronics instead of replacing',
    impact: 40,
    difficulty: 'medium',
    priority: 2,
    description:
      'Manufacturing new electronics is carbon-intensive. Extending device life by 2 years saves significant CO2.',
  },
  {
    id: 18,
    category: 'shopping',
    action: 'Choose products with less packaging',
    impact: 10,
    difficulty: 'easy',
    priority: 3,
    description:
      'Excess packaging contributes to both manufacturing emissions and landfill methane.',
  },
  {
    id: 19,
    category: 'shopping',
    action: 'Buy quality items that last longer',
    impact: 30,
    difficulty: 'medium',
    priority: 4,
    description:
      'Investing in durable goods reduces the frequency of replacement and total lifetime emissions.',
  },
  {
    id: 20,
    category: 'shopping',
    action: 'Use a reusable shopping bag',
    impact: 5,
    difficulty: 'easy',
    priority: 5,
    description:
      'A single reusable bag replaces hundreds of disposable bags, reducing plastic and CO2.',
  },
  {
    id: 21,
    category: 'transportation',
    action: 'Work from home one extra day per week',
    impact: 50,
    difficulty: 'easy',
    priority: 6,
    description:
      'Eliminating one commute day per week reduces transport emissions by about 20%.',
  },
  {
    id: 22,
    category: 'energy',
    action: 'Air-dry clothes instead of using a dryer',
    impact: 15,
    difficulty: 'easy',
    priority: 6,
    description:
      'Clothes dryers are one of the most energy-hungry appliances. Air-drying saves both energy and extends fabric life.',
  },
];

/** Achievement badges that users can unlock */
export const BADGES: Badge[] = [
  {
    id: 1,
    name: 'First Step',
    description: 'Log your first carbon footprint activity',
    icon: '👣',
    unlockedAt: null,
  },
  {
    id: 2,
    name: 'Week Warrior',
    description: 'Log activities for 7 consecutive days',
    icon: '🏆',
    unlockedAt: null,
  },
  {
    id: 3,
    name: 'Green Commuter',
    description: 'Use zero-emission transport 10 times',
    icon: '🚲',
    unlockedAt: null,
  },
  {
    id: 4,
    name: 'Energy Saver',
    description: 'Reduce energy emissions by 20% in a month',
    icon: '💡',
    unlockedAt: null,
  },
  {
    id: 5,
    name: 'Plant Power',
    description: 'Log 30 plant-based meals',
    icon: '🌱',
    unlockedAt: null,
  },
  {
    id: 6,
    name: 'Carbon Cutter',
    description: 'Reduce total emissions by 50 kg in a month',
    icon: '✂️',
    unlockedAt: null,
  },
  {
    id: 7,
    name: 'Eco Shopper',
    description: 'Keep shopping emissions under 10 kg for a month',
    icon: '🛍️',
    unlockedAt: null,
  },
  {
    id: 8,
    name: 'Data Nerd',
    description: 'Log 100 activities total',
    icon: '📊',
    unlockedAt: null,
  },
  {
    id: 9,
    name: 'Month Master',
    description: 'Log activities for 30 consecutive days',
    icon: '📅',
    unlockedAt: null,
  },
  {
    id: 10,
    name: 'Climate Champion',
    description: 'Achieve below-average emissions for 3 consecutive months',
    icon: '🌍',
    unlockedAt: null,
  },
  {
    id: 11,
    name: 'Zero Hero',
    description: 'Have a day with zero transport emissions',
    icon: '🦸',
    unlockedAt: null,
  },
];

/** Community challenges available for users to join */
export const CHALLENGES: Challenge[] = [
  {
    id: 1,
    title: 'Car-Free Week',
    description: 'Go an entire week without using a personal car. Use walking, cycling, or public transit instead.',
    target: 7,
    unit: 'days',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    participants: 0,
  },
  {
    id: 2,
    title: 'Meatless Month',
    description: 'Eat only plant-based meals for an entire month to dramatically cut food emissions.',
    target: 30,
    unit: 'days',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    participants: 0,
  },
  {
    id: 3,
    title: 'Energy Reduction Sprint',
    description: 'Reduce your electricity consumption by 20% compared to last month.',
    target: 20,
    unit: 'percent',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    participants: 0,
  },
  {
    id: 4,
    title: 'Zero Waste Shopping',
    description: 'Buy only second-hand or sustainable products for two weeks.',
    target: 14,
    unit: 'days',
    startDate: '2026-06-15',
    endDate: '2026-06-30',
    participants: 0,
  },
  {
    id: 5,
    title: '100 km Cycling Challenge',
    description: 'Cycle 100 km total this month instead of driving.',
    target: 100,
    unit: 'km',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    participants: 0,
  },
  {
    id: 6,
    title: 'Local Food Fortnight',
    description: 'Eat only locally sourced food for two weeks.',
    target: 14,
    unit: 'days',
    startDate: '2026-06-01',
    endDate: '2026-06-14',
    participants: 0,
  },
];

/** Average monthly emissions for comparison (kg CO2) */
export const AVERAGE_MONTHLY_EMISSIONS = 350;

/** Average emissions per category (kg CO2 per month) */
export const AVERAGE_CATEGORY_EMISSIONS: Record<EmissionCategory, number> = {
  transportation: 150,
  energy: 100,
  food: 70,
  shopping: 30,
};
