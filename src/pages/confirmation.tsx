import { Link, useLocation, useParams } from "react-router";
import { formatCents } from "../lib/money";

export function Confirmation() {
  const { number } = useParams();
  const state = useLocation().state as { email?: string; totalCents?: number } | null;
  return (
    <div className="mx-auto max-w-xl px-4 pt-16 text-center">
      <p className="eyebrow text-muted">Order {number}</p>
      <h1 tabIndex={-1} className="mt-3 font-display text-4xl outline-none">Thank you!</h1>
      {state?.email && state.totalCents !== undefined ? (
        <p className="mt-4 text-muted">
          Your order of {formatCents(state.totalCents)} was placed. In a real store, the confirmation would go to {state.email}.
        </p>
      ) : (
        <p className="mt-4 text-muted">Your order was placed.</p>
      )}
      <Link to="/shop" className="btn mt-8">Keep shopping</Link>
    </div>
  );
}
