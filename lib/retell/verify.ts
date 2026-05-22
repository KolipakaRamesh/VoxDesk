import { createHmac } from 'crypto';

/**
 * Verifies a Retell AI webhook request signature.
 *
 * Retell signs each webhook with HMAC-SHA256 using your API key.
 * The signature is sent in the `x-retell-signature` header.
 *
 * @param rawBody - Raw request body as a string (before JSON.parse)
 * @param signature - Value of the `x-retell-signature` header
 * @returns true if the signature is valid
 */
export function verifyRetellSignature(
  rawBody: string,
  signature: string
): boolean {
  const apiKey = process.env.RETELL_API_KEY;

  if (!apiKey) {
    console.error('[RetellVerify] RETELL_API_KEY is not set');
    return false;
  }

  if (!signature) {
    console.warn('[RetellVerify] No x-retell-signature header present');
    return false;
  }

  try {
    const expectedSig = createHmac('sha256', apiKey)
      .update(rawBody)
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    return timingSafeEqual(signature, expectedSig);
  } catch (err) {
    console.error('[RetellVerify] Signature verification error:', err);
    return false;
  }
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
