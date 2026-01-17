/**
 * Hook to calculate profile completion percentage
 */

import { useMemo } from 'react';

interface ProfileUser {
  name: string | null;
  email: string | null;
  phone?: string | null;
  company_name?: string | null;
  hourly_rate?: number | null;
  grace_period_minutes?: number | null;
  invoice_terms?: string | null;
  invoice_logo_url?: string | null;
}

interface ProfileCompletionResult {
  percentage: number;
  completedFields: string[];
  missingFields: string[];
}

/**
 * Calculate profile completion based on filled fields
 */
export function useProfileCompletion(user: ProfileUser | null): ProfileCompletionResult {
  return useMemo(() => {
    if (!user) {
      return {
        percentage: 0,
        completedFields: [],
        missingFields: ['name', 'email', 'phone', 'company_name', 'hourly_rate'],
      };
    }

    // Define fields and their weights
    const fields = [
      { key: 'name', weight: 20, value: user.name },
      { key: 'email', weight: 20, value: user.email },
      { key: 'phone', weight: 15, value: user.phone },
      { key: 'company_name', weight: 15, value: user.company_name },
      { key: 'hourly_rate', weight: 15, value: user.hourly_rate },
      { key: 'invoice_terms', weight: 10, value: user.invoice_terms },
      { key: 'invoice_logo_url', weight: 5, value: user.invoice_logo_url },
    ];

    const completedFields: string[] = [];
    const missingFields: string[] = [];
    let completedWeight = 0;

    for (const field of fields) {
      const isComplete = field.value !== null && field.value !== undefined && field.value !== '';
      
      if (isComplete) {
        completedFields.push(field.key);
        completedWeight += field.weight;
      } else {
        missingFields.push(field.key);
      }
    }

    return {
      percentage: completedWeight,
      completedFields,
      missingFields,
    };
  }, [user]);
}
