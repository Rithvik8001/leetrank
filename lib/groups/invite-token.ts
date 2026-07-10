// Ambiguity-free alphabet (no 0/O, 1/I, L), matching the verification-code idiom.
export const INVITE_TOKEN_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export const INVITE_TOKEN_LENGTH = 12;

// A stable, URL-safe invite token for a group. No prefix, no expiry — the owner
// can regenerate it to revoke the previous link.
export function generateInviteToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(INVITE_TOKEN_LENGTH));
  let token = "";
  for (const byte of bytes) {
    token += INVITE_TOKEN_ALPHABET[byte % INVITE_TOKEN_ALPHABET.length];
  }
  return token;
}
