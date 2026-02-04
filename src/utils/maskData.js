/**
 * Masks an email: first character + *** + @domain
 * Example: "john@example.com" => "j***@example.com"
 */
const maskEmail = (email) => {
  if (!email) return null;
  const [local, domain] = email.split('@');
  return `${local.charAt(0)}***@${domain}`;
};

/**
 * Masks a phone number: shows country code + area code + *** ** + last 2 digits
 * Example: "+94771234567" => "+94 77 *** **67"
 */
const maskPhone = (phone) => {
  if (!phone) return null;

  const hasPlus = phone.startsWith('+');
  const digits = phone.replace(/\D/g, '');

  if (digits.length < 6) return phone;

  const lastTwo = digits.slice(-2);

  if (hasPlus && digits.length >= 10) {
    const countryCode = digits.substring(0, 2);
    const areaCode = digits.substring(2, 4);
    return `+${countryCode} ${areaCode} *** **${lastTwo}`;
  }

  // Local number format
  const first4 = digits.substring(0, 4);
  return `${first4} *** **${lastTwo}`;
};

module.exports = { maskEmail, maskPhone };
