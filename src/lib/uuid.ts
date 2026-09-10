let sequence = 0;

function randomByte(): number {
  return Math.floor(Math.random() * 256);
}

export function createUuid(): string {
  const bytes = Array.from({ length: 16 }, randomByte);
  let time = Date.now();
  sequence = (sequence + 1) & 0xFFFF;

  for (let index = 0; index < 6; index += 1) {
    bytes[index] ^= time & 0xFF;
    time = Math.floor(time / 256);
  }

  bytes[6] = (bytes[6] & 0x0F) | 0x40;
  bytes[8] = (bytes[8] & 0x3F) | 0x80;
  bytes[14] ^= sequence >> 8;
  bytes[15] ^= sequence & 0xFF;

  const hex = bytes.map(byte => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
