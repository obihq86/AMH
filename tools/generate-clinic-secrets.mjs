import { randomBytes, scryptSync } from 'node:crypto';

const pin = await new Promise((resolve) => {
  const stdin = process.stdin;
  process.stdout.write('৮ অঙ্কের numeric login password লিখুন: ');
  if (!stdin.isTTY) {
    console.error('Run this command in an interactive terminal so the password is not echoed.');
    process.exit(1);
  }
  stdin.setRawMode(true);
  stdin.resume();
  let value = '';
  const onData = (buffer) => {
    for (const key of buffer.toString('utf8')) {
      if (key === '\u0003') process.exit(1);
      if (key === '\r' || key === '\n') {
        stdin.removeListener('data', onData);
        stdin.setRawMode(false);
        process.stdout.write('\n');
        resolve(value);
        return;
      }
      if (key === '\u007f' || key === '\b') {
        value = value.slice(0, -1);
        continue;
      }
      const banglaDigit = '০১২৩৪৫৬৭৮৯'.indexOf(key);
      const digit = banglaDigit >= 0 ? String(banglaDigit) : key;
      if (/^\d$/.test(digit) && value.length < 8) value += digit;
    }
  };
  stdin.on('data', onData);
});

if (!/^\d{8}$/.test(pin)) {
  console.error('Password must contain exactly 8 digits.');
  process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(pin, salt, 64);
const sessionSecret = randomBytes(32).toString('base64url');
console.log(`CLINIC_PIN_HASH=scrypt$${salt.toString('base64url')}$${hash.toString('base64url')}`);
console.log(`CLINIC_SESSION_SECRET=${sessionSecret}`);
