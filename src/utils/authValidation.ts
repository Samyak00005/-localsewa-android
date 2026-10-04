export type ValidationResult =
  | {valid: true}
  | {valid: false; message: string};

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PHONE_PATTERN =
  /^\+?[0-9]{7,15}$/;

export function normalizeEmail(
  value: string,
): string {
  return value.trim().toLowerCase();
}

export function normalizePhone(
  value: string,
): string {
  return value.replace(
    /[\s()-]/g,
    '',
  );
}

export function validateEmail(
  value: string,
): ValidationResult {
  const email = normalizeEmail(value);

  if (!email) {
    return {
      valid: false,
      message: 'Enter your email address.',
    };
  }

  if (
    email.length > 254 ||
    !EMAIL_PATTERN.test(email)
  ) {
    return {
      valid: false,
      message:
        'Enter a valid email address.',
    };
  }

  return {valid: true};
}

export function validatePhone(
  value: string,
): ValidationResult {
  const phone = normalizePhone(value);

  if (!phone) {
    return {
      valid: false,
      message:
        'Enter your mobile number.',
    };
  }

  if (!PHONE_PATTERN.test(phone)) {
    return {
      valid: false,
      message:
        'Enter a valid mobile number.',
    };
  }

  return {valid: true};
}

export function validateIdentifier(
  value: string,
): ValidationResult {
  const identifier = value.trim();

  if (!identifier) {
    return {
      valid: false,
      message:
        'Enter your email or mobile number.',
    };
  }

  if (identifier.includes('@')) {
    return validateEmail(identifier);
  }

  return validatePhone(identifier);
}

export function validateFullName(
  value: string,
): ValidationResult {
  const name = value.trim();

  if (name.length < 2) {
    return {
      valid: false,
      message:
        'Enter your full name.',
    };
  }

  if (name.length > 80) {
    return {
      valid: false,
      message:
        'Name is too long.',
    };
  }

  return {valid: true};
}

export function validatePassword(
  value: string,
): ValidationResult {
  if (!value) {
    return {
      valid: false,
      message: 'Enter a password.',
    };
  }

  if (value.length < 8) {
    return {
      valid: false,
      message:
        'Password must be at least 8 characters.',
    };
  }

  if (value.length > 128) {
    return {
      valid: false,
      message:
        'Password is too long.',
    };
  }

  return {valid: true};
}

export function validateOtp(
  value: string,
): ValidationResult {
  if (!/^\d{6}$/.test(value.trim())) {
    return {
      valid: false,
      message:
        'Enter the 6-digit verification code.',
    };
  }

  return {valid: true};
}
