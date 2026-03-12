import crypto from "crypto";

/**
 * Generates an HMAC SHA-256 token for a given session using the project's S2S secret.
 * @param oiSession The unique session ID for the respondent
 * @param secret The S2S secret for the project
 * @returns Hex string of the HMAC signature
 */
export function generateS2SToken(oiSession: string, secret: string): string {
  if (!secret) return "";
  return crypto
    .createHmac("sha256", secret)
    .update(oiSession)
    .digest("hex");
}

/**
 * Verifies if a provided token matches the expected signature for a session.
 * @param providedToken The token sent by the client survey platform
 * @param oiSession The session ID to verify against
 * @param secret The S2S secret for the project
 * @returns boolean 
 */
export function verifyS2SToken(providedToken: string, oiSession: string, secret: string): boolean {
  if (!providedToken || !secret) return false;
  
  const expectedToken = generateS2SToken(oiSession, secret);
  
  // Use timingSafeEqual to prevent timing attacks
  try {
    const providedBuffer = Buffer.from(providedToken, "hex");
    const expectedBuffer = Buffer.from(expectedToken, "hex");
    
    if (providedBuffer.length !== expectedBuffer.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
  } catch (err) {
    return false; // Handle invalid hex strings
  }
}
