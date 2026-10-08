import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
export const noWhitespaceValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (value === null || value === undefined || value === '') return null;
  return String(value).trim().length > 0 ? null : { whitespace: true };
};
export const strictEmailValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '').trim();
  if (!value) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) ? null : { strictEmail: true };
};
//validation