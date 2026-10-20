export function validateIBAN(iban) {
  if (!iban || typeof iban !== 'string') return false;
  const clean = iban.replace(/\s+/g, '').toUpperCase();
  if (clean.length !== 24 || !clean.startsWith('PK')) return false;

  const rearranged = clean.slice(4) + clean.slice(0, 4);
  let numeric = '';
  for (let i = 0; i < rearranged.length; i++) {
    const code = rearranged.charCodeAt(i);
    if (code >= 65 && code <= 90) {
      numeric += (code - 55).toString();
    } else if (code >= 48 && code <= 57) {
      numeric += rearranged[i];
    } else {
      return false;
    }
  }

  let remainder = 0;
  for (let i = 0; i < numeric.length; i += 7) {
    const block = remainder.toString() + numeric.substring(i, i + 7);
    remainder = parseInt(block, 10) % 97;
  }

  return remainder === 1;
}

export function calculateCRC16(str) {
  let crc = 0xffff;
  for (let c = 0; c < str.length; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function formatTLV(tag, val) {
  const len = Buffer.byteLength(val, 'utf8').toString().padStart(2, '0');
  return `${tag}${len}${val}`;
}

export function generateRaastQR({ iban, amount, merchantName, merchantCity, reference, expiry }) {
  const cleanIban = iban.replace(/\s+/g, '').toUpperCase();
  
  let amtStr = '';
  if (amount !== undefined && amount !== null && amount !== '') {
    const parsed = Number(amount);
    if (!isNaN(parsed) && parsed > 0) {
      amtStr = parsed.toFixed(2).replace(/\.00$/, '');
    }
  }

  const isDynamic = Boolean(amtStr);

  // Official SBP Raast P2P TLV specification parsed by SadaPay, NayaPay & banks:
  // Tag 00: Format version (02)
  // Tag 01: Initiation method (11 = Static, 12 = Dynamic)
  // Tag 02: Payload type (00)
  // Tag 04: Destination IBAN (24 chars)
  let payload = formatTLV('00', '02')
    + formatTLV('01', isDynamic ? '12' : '11')
    + formatTLV('02', '00')
    + formatTLV('04', cleanIban);

  // Tag 05: Transaction Amount
  if (amtStr) {
    payload += formatTLV('05', amtStr);
  }

  // Tag 07: Expiry (optional)
  if (expiry) {
    payload += formatTLV('07', expiry);
  }

  // Tag 10: Checksum placeholder and CRC-16 calculation
  const crcPrefix = payload + '1004';
  const checksum = calculateCRC16(crcPrefix);
  return `${crcPrefix}${checksum}`;
}
