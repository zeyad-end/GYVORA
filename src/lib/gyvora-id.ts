export const isGyvoraId = (value: string): boolean => /^GYVORA-[GC]-[1-9][0-9]{2,}$/.test(value);
export const normalizeAccountLookup = (value: string): string => value.trim().replace(/^ironhaus:member:/, '').replace(/^gyvora:/i, '');
/** The QR payload contains no contact details or authentication credential. */
export function accountQrValue(id: string): string {
  if (!isGyvoraId(id)) throw new Error('Permanent GYVORA ID unavailable');
  return id;
}