/**
 * Clinical Drug Allergy Conflict Rules Engine
 * Detects cross-reactivity between patient's documented allergies and prescribed medications
 */

export interface AllergyConflict {
  drugName: string;
  matchedAllergy: string;
  severity: 'CRITICAL' | 'WARNING';
  reason: string;
}

const ALLERGY_DRUG_MAP: Record<string, { triggers: string[]; reason: string }> = {
  penicillin: {
    triggers: [
      'amoxicillin',
      'augmentin',
      'ampicillin',
      'penicillin',
      'piperacillin',
      'cloxacillin',
      'moxikind',
      'novamox',
      'cefixime',
      'cephalexin',
      'cefpodoxime',
    ],
    reason: 'Drug contains a Beta-lactam structure. High cross-reactivity risk of anaphylaxis/urticaria.',
  },
  sulfa: {
    triggers: [
      'sulfa',
      'cotrimoxazole',
      'bactrim',
      'septran',
      'sulfamethoxazole',
      'sulfasalazine',
      'celecoxib',
      'nimesulide',
    ],
    reason: 'Drug contains a sulfonamide group. Potential hypersensitivity/Stevens-Johnson syndrome risk.',
  },
  aspirin: {
    triggers: [
      'aspirin',
      'ecosprin',
      'ibuprofen',
      'brufen',
      'combiflam',
      'diclofenac',
      'voveran',
      'aceclofenac',
      'zerodol',
      'naproxen',
      'ketorolac',
      'mefenamic',
      'meftal',
    ],
    reason: 'Non-Steroidal Anti-Inflammatory Drug (NSAID). High risk of bronchospasm or severe gastric erosion.',
  },
  quinolone: {
    triggers: ['ciprofloxacin', 'cifran', 'levofloxacin', 'levomac', 'ofloxacin', 'norfloxacin'],
    reason: 'Fluoroquinolone antibiotic. Risk of tendonitis, QT prolongation or hypersensitivity.',
  },
  pollen: {
    triggers: [],
    reason: 'Environmental allergen.',
  },
  dust: {
    triggers: [],
    reason: 'Environmental allergen.',
  },
};

export function checkDrugAllergyConflicts(
  patientAllergies: string | null | undefined,
  prescribedMedicines: { medicineName: string }[]
): AllergyConflict[] {
  if (!patientAllergies || !patientAllergies.trim() || !prescribedMedicines?.length) {
    return [];
  }

  const conflicts: AllergyConflict[] = [];
  const normalizedAllergies = patientAllergies.toLowerCase();

  for (const med of prescribedMedicines) {
    const medNameLower = med.medicineName.toLowerCase();

    for (const [allergyKey, rule] of Object.entries(ALLERGY_DRUG_MAP)) {
      if (normalizedAllergies.includes(allergyKey)) {
        // Check if prescribed medicine matches any trigger keyword
        const matchedTrigger = rule.triggers.find((trigger) => medNameLower.includes(trigger));

        if (matchedTrigger) {
          conflicts.push({
            drugName: med.medicineName,
            matchedAllergy: allergyKey.toUpperCase(),
            severity: 'CRITICAL',
            reason: rule.reason,
          });
        }
      }
    }
  }

  return conflicts;
}
