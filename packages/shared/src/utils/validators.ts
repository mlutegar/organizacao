// Validadores compartilhados

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  // Mínimo 8 caracteres, pelo menos uma letra e um número
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password);
}

export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
