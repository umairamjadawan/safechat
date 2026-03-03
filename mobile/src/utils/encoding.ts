import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from 'tweetnacl-util';

export const toBase64 = (data: Uint8Array): string => encodeBase64(data);
export const fromBase64 = (data: string): Uint8Array => decodeBase64(data);
export const toUTF8 = (data: Uint8Array): string => encodeUTF8(data);
export const fromUTF8 = (data: string): Uint8Array => decodeUTF8(data);
