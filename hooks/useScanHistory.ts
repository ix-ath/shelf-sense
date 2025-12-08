
import { useState, useEffect } from 'react';
import { ScanHistoryItem, SubstituteRecommendation } from '../types';
import { HISTORY_KEY } from '../constants';

export const useScanHistory = () => {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  const saveToHistory = (data: SubstituteRecommendation) => {
    const newItem: ScanHistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      summary: {
        productName: data.productName,
        matchType: data.matchType,
        locationDescription: data.locationDescription
      },
      fullData: data
    };

    const updatedHistory = [newItem, ...history].slice(0, 5); // Keep last 5
    setHistory(updatedHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  return { history, saveToHistory, clearHistory };
};
