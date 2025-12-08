
export type ThemeId = 'default' | 'dark' | 'berry' | 'ocean';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  primary: string; // Tailwind color name (e.g., 'violet')
  bg: string;
  headerBg: string;
  text: string;
  cardBg: string;
  borderColor: string;
}

export interface ShelfItemLocation {
  productName: string;
  reasoning: string;
  locationDescription: string;
  visualCues: {
    color: string;
    labelDetails: string;
    shelfPosition: string;
  };
  boundingBox?: {
    ymin: number;
    xmin: number;
    ymax: number;
    xmax: number;
  };
}

export interface SubstituteRecommendation extends ShelfItemLocation {
  matchType: 'EXACT_MATCH' | 'SUBSTITUTE' | 'FUNCTIONAL_ALTERNATIVE' | 'WRONG_AISLE';
  matchScore: number; // 0-100
  healthHighlights: string[];
  nutritionalComparison: string;
  verifiedSources?: {
    uri: string;
    title: string;
  }[];
  detectedItemCount: number;
  otherCandidates: {
    name: string;
    reasonExcluded: string;
  }[];
  supplementaryItems?: ShelfItemLocation[];
}

export interface ScanHistoryItem {
  id: string;
  timestamp: number;
  summary: {
    productName: string;
    matchType: SubstituteRecommendation['matchType'];
    locationDescription: string;
  };
  fullData: SubstituteRecommendation;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}
