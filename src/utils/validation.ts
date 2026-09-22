export function isInstitutionalEmail(email: string): boolean {
  return /^[^\s@]+@unsa\.edu\.pe$/i.test(email.trim());
}

export function isValidStudentCode(code: string): boolean {
  return /^\d{8}$/.test(code.trim());
}

export interface PasswordChecks {
  minLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
}

export function getPasswordChecks(password: string): PasswordChecks {
  return {
    minLength: password.length >= 8,
    hasLetter: /[A-Za-z]/.test(password),
    hasNumber: /\d/.test(password)
  };
}

export function isPasswordValid(password: string): boolean {
  const checks = getPasswordChecks(password);
  return checks.minLength && checks.hasLetter && checks.hasNumber;
}