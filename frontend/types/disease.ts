// frontend/types/disease.ts

export interface DiseaseResponse {
  id: string;
  diseaseId: string;
  name: string;
  category: string;
  symptoms: string[];
  description: string;
  prevention: string[];
  severity: 'mild' | 'mild-moderate' | 'moderate' | 'moderate-severe' | 'severe';
  createdAt: string;
  updatedAt: string;
}

export type DiseaseCategory = 
  | 'Respiratory'
  | 'Viral'
  | 'Kidney'
  | 'Endocrine'
  | 'Urinary'
  | 'Gastrointestinal'
  | 'Dental'
  | 'Skin'
  | 'Parasitic'
  | 'Cardiac'
  | 'Neurological'
  | 'Oncological';

export type DiseaseSeverity = 'mild' | 'mild-moderate' | 'moderate' | 'moderate-severe' | 'severe';