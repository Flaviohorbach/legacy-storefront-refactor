import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { useCart } from "../lib/cart-store";
import { orderNumber, validateCheckout, type CheckoutErrors, type CheckoutForm } from "../lib/checkout";
import { Summary } from "./summary";

const FIELDS: { name: keyof CheckoutForm; label: string; autoComplete: string; type?: string; inputMode?: "numeric" }[] = [
  { name: "fullName", label: "Full name", autoComplete: "name" },
  { name: "email", label: "Email", autoComplete: "email", type: "email" },
  { name: "address", label: "Address", autoComplete: "street-address" },
  { name: "city", label: "City", autoComplete: "address-level2" },
  { name: "zip", label: "ZIP code", autoComplete: "postal-code", inputMode: "numeric" },
];

export function Checkout() {
  const { lines, totals, clear } = useCart();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [placed, setPlaced] = useState(false);

  // After the order is placed the cart is empty too; that case must not bounce to /cart.
  if (lines.length === 0 && !placed) return <Navigate to="/cart" replace />;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.currentTarget)) as unknown as CheckoutForm;
    const found = validateCheckout(form);
    setErrors(found);
    const first = FIELDS.find((f) => found[f.name]);
    if (first) {
      document.getElementById(first.name)?.focus(); // take the user straight to what needs fixing
      return;
    }
    setPlaced(true);
    clear();
    navigate(`/order/${orderNumber()}`, { replace: true, state: { email: form.email.trim(), totalCents: totals.totalCents } });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
      <h1 tabIndex={-1} className="font-display text-4xl outline-none">Checkout</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_20rem]">
        <form noValidate onSubmit={submit} className="space-y-5" aria-describedby="demo-note">
          <p id="demo-note" className="border-l-2 border-ink bg-wash p-3 text-sm">
            This is a demo store. No payment is taken and nothing is shipped.
          </p>
          {FIELDS.map((f) => (
            <div key={f.name}>
              <label htmlFor={f.name} className="block text-sm font-normal">{f.label}</label>
              <input
                id={f.name}
                name={f.name}
                type={f.type ?? "text"}
                inputMode={f.inputMode}
                autoComplete={f.autoComplete}
                aria-invalid={errors[f.name] ? true : undefined}
                aria-describedby={errors[f.name] ? `${f.name}-error` : undefined}
                className="mt-1 w-full border border-line px-3 py-2.5 aria-invalid:border-sale"
              />
              {errors[f.name] && (
                <p id={`${f.name}-error`} className="mt-1 text-sm text-sale">{errors[f.name]}</p>
              )}
            </div>
          ))}
          <button type="submit" className="btn w-full sm:w-auto">Place order</button>
        </form>
        <aside aria-labelledby="summary">
          <Summary totals={totals} />
          <Link to="/cart" className="mt-4 block text-center text-sm underline">Edit cart</Link>
        </aside>
      </div>
    </div>
  );
}
