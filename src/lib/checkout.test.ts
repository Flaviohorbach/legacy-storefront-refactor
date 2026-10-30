import { describe, expect, it } from "vitest";
import { orderNumber, validateCheckout, type CheckoutForm } from "./checkout";

const valid: CheckoutForm = { fullName: "Ana Souza", email: "ana@example.com", address: "5th Avenue, 100", city: "New York", zip: "10001" };

describe("validateCheckout", () => {
  it("accepts a complete form", () => {
    expect(validateCheckout(valid)).toEqual({});
    expect(validateCheckout({ ...valid, zip: "10001-1234" })).toEqual({});
  });

  it("flags every empty field with a message that says how to fix it", () => {
    const errors = validateCheckout({ fullName: "", email: "", address: "", city: "", zip: "" });
    expect(Object.keys(errors).sort()).toEqual(["address", "city", "email", "fullName", "zip"]);
    expect(errors.zip).toMatch(/5-digit/);
  });

  it("does not accept whitespace as content", () => {
    expect(validateCheckout({ ...valid, fullName: "   Ana   " }).fullName).toBeDefined();
    expect(validateCheckout({ ...valid, city: "   " }).city).toBeDefined();
  });

  it("rejects malformed email and ZIP", () => {
    expect(validateCheckout({ ...valid, email: "ana@example" }).email).toBeDefined();
    expect(validateCheckout({ ...valid, zip: "1000" }).zip).toBeDefined();
    expect(validateCheckout({ ...valid, zip: "01310-100" }).zip).toBeDefined(); // a Brazilian CEP is not a US ZIP
  });
});

describe("orderNumber", () => {
  it("has the AV- prefix and no ambiguous characters", () => {
    for (let i = 0; i < 200; i++) expect(orderNumber()).toMatch(/^AV-[A-HJ-NP-Z2-9]{6}$/);
  });

  it("is deterministic given the random source", () => {
    expect(orderNumber(() => 0)).toBe("AV-AAAAAA");
  });
});
