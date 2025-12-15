// utils/disease-details.ts

import { DiseaseSeverity } from "@/types/disease";

// Severity badge colors
const getSeverityColor = (severity: DiseaseSeverity) => {
  switch (severity) {
    case 'mild':
      return { 
        bg: 'bg-green-100',
        border: 'border border-green-200',
        text: 'text-green-700'
      };
    case 'mild-moderate':
      return { 
        bg: 'bg-yellow-100',
        border: 'border border-yellow-200',
        text: 'text-yellow-700'
      };
    case 'moderate':
      return { 
        bg: 'bg-orange-100',
        border: 'border border-orange-200',
        text: 'text-orange-700'
      };
    case 'moderate-severe':
      return { 
        bg: 'bg-red-100',
        border: 'border border-red-200',
        text: 'text-red-700'
      };
    case 'severe':
      return { 
        bg: 'bg-red-200',
        border: 'border border-red-400',
        text: 'text-red-900'
      };
    default:
      return { 
        bg: 'bg-gray-100',
        border: 'border border-gray-200',
        text: 'text-gray-700'
      };
  }
};

// Category icon
const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, string> = {
    Respiratory: 'lungs',
    Viral: 'virus',
    Kidney: 'droplet',
    Endocrine: 'dna',
    Urinary: 'toilet',
    Gastrointestinal: 'stomach',
    Dental: 'tooth',
    Skin: 'hand-dots',
    Parasitic: 'bug',
    Cardiac: 'heart-pulse',
    Neurological: 'brain',
    Oncological: 'ribbon',
  };

  return iconMap[category] || 'circle-info';
};

export { getCategoryIcon, getSeverityColor };
