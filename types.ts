export interface AthleteProfile {
  name: string;
  discipline: string;
  yearsOfPractice: number;
  email: string;
  phone: string;
}

export type QuestionnaireType = 'IPPS' | 'TIPI' | 'MIS' | 'ERQ' | 'PPS' | 'CFQ' | 'BNSSS' | 'SEQ' | 'PESD';

export interface QuestionnaireData {
  ipps: number[];
  tipi: number[];
  mis: number[];
  erq: number[];
  pps: number[];
  cfq: number[];
  bnsss: number[];
  seq: number[];
  mts: number[];
  ct: number[];
  pesd: number[];
}

export interface PesdItem {
  left: string;
  right: string;
}

export interface AssessmentRecord extends AthleteProfile, QuestionnaireData {
  id: string;
  date: string; // created_at in DB
  created_at?: string;
}

export interface TabProps {
  data: number[];
  onChange: (index: number, value: number) => void;
}