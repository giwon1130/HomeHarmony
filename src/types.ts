export type CommuteLevel = "도보권" | "대중교통 30분" | "대중교통 45분";

export interface ApartmentCandidate {
  id: string;
  name: string;
  district: string;
  price억: number;
  monthlyFee만: number;
  size평: number;
  commute: CommuteLevel;
  latitude: number;
  longitude: number;
  transitScore: number;
  convenienceScore: number;
  educationScore: number;
  environmentScore: number;
  summary: string;
  strengths: string[];
  cautions: string[];
  nearbyHighlights: Array<{
    label: string;
    distanceMinutes: number;
  }>;
}
