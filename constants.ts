
import { ThemeConfig, ThemeId } from './types';

export const HISTORY_KEY = 'shelfSense_history_v1';
export const THEME_KEY = 'shelfSense_theme_v1';
export const GLOBAL_PREFS_KEY = 'shelfSense_global_prefs_v1';

export const THEMES: Record<ThemeId, ThemeConfig> = {
  default: { id: 'default', name: 'ShelfSense (Default)', primary: 'violet', bg: 'bg-[#F8FAFC]', headerBg: 'bg-white/80', text: 'text-slate-900', cardBg: 'bg-white', borderColor: 'border-slate-100' },
  dark: { id: 'dark', name: 'Midnight (Dark)', primary: 'violet', bg: 'bg-slate-950', headerBg: 'bg-slate-900/80', text: 'text-slate-50', cardBg: 'bg-slate-900', borderColor: 'border-slate-800' },
  berry: { id: 'berry', name: 'Berry', primary: 'pink', bg: 'bg-pink-50', headerBg: 'bg-white/80', text: 'text-slate-900', cardBg: 'bg-white', borderColor: 'border-pink-100' },
  ocean: { id: 'ocean', name: 'Ocean', primary: 'blue', bg: 'bg-blue-50', headerBg: 'bg-white/80', text: 'text-slate-900', cardBg: 'bg-white', borderColor: 'border-blue-100' },
};

export const AVAILABLE_TAGS = {
  "Dietary Style": ["Vegan", "Vegetarian", "Keto", "Paleo", "Pescatarian", "Whole30", "Mediterranean"],
  "Free From": ["Gluten-Free", "Dairy-Free", "Nut-Free", "Soy-Free", "Egg-Free", "Lactose-Free", "Grain-Free"],
  "Health Goals": ["Low Sodium", "Low Sugar", "No Added Sugar", "Sugar-Free", "High Protein", "Low Carb", "Low Fat", "Heart Healthy", "Diabetic Friendly"],
  "Sourcing & Ethics": ["Organic", "Non-GMO", "Fair Trade", "Locally Grown", "Sustainable"],
  "Religious": ["Kosher", "Halal"]
};
