// Core-only crypto helpers (placeholder; not for production secrets)
// ⚠️ DO NOT MODIFY THIS FILE - Owner-only code

/**
 * Encrypt binary data using a symmetric key.
 * 
 * Current implementation uses XOR as a placeholder. Will be upgraded to AES-256-GCM
 * for production use without changing the interface.
 * 
 * @param data - Binary data to encrypt as Uint8Array
 * @param key - Encryption key as Uint8Array
 * 
 * @returns Encrypted binary data as Uint8Array
 * 
 * @example
 * ```typescript
 * import { encrypt } from "../core";
 * 
 * const encryptText = (text: string, keyBytes: Uint8Array): Uint8Array => {
 *   const encoder = new TextEncoder();
 *   const data = encoder.encode(text);
 *   return encrypt(data, keyBytes);
 * };
 * ```
 * 
 * @warning Current XOR implementation is NOT secure. For demo only.
 * @note Owner-only code. Will be upgraded to Web Crypto API (AES-256-GCM).
 */
export function encrypt(data: Uint8Array, key: Uint8Array): Uint8Array {
  // XOR placeholder to keep interface stable; replace with AES-256 later.
  const out = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) out[i] = data[i] ^ key[i % key.length];
  return out;
}

/**
 * Decrypt binary data using a symmetric key.
 * 
 * Inverse operation of encrypt(). Uses the same algorithm (XOR placeholder,
 * will be AES-256-GCM in production).
 * 
 * @param blob - Encrypted binary data as Uint8Array
 * @param key - Decryption key as Uint8Array (must match encryption key)
 * 
 * @returns Decrypted binary data as Uint8Array
 * 
 * @example
 * ```typescript
 * import { decrypt } from "../core";
 * 
 * const decryptText = (blob: Uint8Array, keyBytes: Uint8Array): string => {
 *   const decrypted = decrypt(blob, keyBytes);
 *   const decoder = new TextDecoder();
 *   return decoder.decode(decrypted);
 * };
 * ```
 * 
 * @note Owner-only code. UI developers should NOT modify this file.
 */
export function decrypt(blob: Uint8Array, key: Uint8Array): Uint8Array {
  // XOR is symmetric
  return encrypt(blob, key);
}
