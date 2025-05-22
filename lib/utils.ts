import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a random password with mixed characters
 * @param length Length of the password (default: 10)
 * @returns A random password string
 */
export function generatePassword(length: number = 10): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=";
  let password = "";

  // Ensure we have at least one character from each character class
  password += charset.slice(0, 26).charAt(Math.floor(Math.random() * 26)); // lowercase
  password += charset.slice(26, 52).charAt(Math.floor(Math.random() * 26)); // uppercase
  password += charset.slice(52, 62).charAt(Math.floor(Math.random() * 10)); // number
  password += charset.slice(62).charAt(Math.floor(Math.random() * (charset.length - 62))); // special

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  // Shuffle the password to avoid predictable pattern
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}
