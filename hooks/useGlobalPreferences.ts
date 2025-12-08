
import { useState, useEffect } from 'react';
import { GLOBAL_PREFS_KEY } from '../constants';

export const useGlobalPreferences = () => {
  const [globalTags, setGlobalTags] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(GLOBAL_PREFS_KEY);
      if (stored) {
        setGlobalTags(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load global preferences", e);
    }
  }, []);

  const toggleTag = (tag: string) => {
    const newTags = globalTags.includes(tag)
      ? globalTags.filter(t => t !== tag)
      : [...globalTags, tag];
    
    setGlobalTags(newTags);
    localStorage.setItem(GLOBAL_PREFS_KEY, JSON.stringify(newTags));
  };

  return { globalTags, toggleTag };
};
