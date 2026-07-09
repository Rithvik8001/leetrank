const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // excludes 0/O, 1/I, L
const CODE_LENGTH = 8;
export const VERIFICATION_CODE_TTL_MS = 30 * 60 * 1000;

export function generateVerificationCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH));
  let code = "";
  for (const byte of bytes) {
    code += CODE_ALPHABET[byte % CODE_ALPHABET.length];
  }
  return `LR-${code}`;
}
