// Checkout validation. The legacy form had no validation at all and posted to
// a URL literally called "post" (action="post"); here every field is checked
// before the order is placed, and the messages say how to fix the problem.

export interface CheckoutForm {
  fullName: string;
  email: string;
  address: string;
  city: string;
  zip: string;
}

export type CheckoutErrors = Partial<Record<keyof CheckoutForm, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// US ZIP: 12345 or 12345-6789.
const ZIP = /^\d{5}(-\d{4})?$/;

export function validateCheckout(form: CheckoutForm): CheckoutErrors {
  const errors: CheckoutErrors = {};
  const value = (key: keyof CheckoutForm) => form[key].trim();
  if (value("fullName").split(/\s+/).length < 2) errors.fullName = "Enter your first and last name.";
  if (!EMAIL.test(value("email"))) errors.email = "Enter an email like name@example.com.";
  if (value("address").length < 5) errors.address = "Enter the street and number.";
  if (value("city").length < 2) errors.city = "Enter the city.";
  if (!ZIP.test(value("zip"))) errors.zip = "Enter a 5-digit ZIP code, like 10001.";
  return errors;
}

/** Order numbers like AV-7K2F9Q: short, readable, no ambiguous characters. */
export function orderNumber(random: () => number = Math.random): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return "AV-" + Array.from({ length: 6 }, () => alphabet[Math.floor(random() * alphabet.length)]).join("");
}
