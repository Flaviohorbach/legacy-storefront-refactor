import { Link } from "react-router";

export function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 pt-16 text-center">
      <p className="eyebrow text-muted">404</p>
      <h1 tabIndex={-1} className="mt-3 font-display text-4xl outline-none">Page not found</h1>
      <p className="mt-4 text-muted">The page you are looking for does not exist or has moved.</p>
      <Link to="/" className="btn mt-8">Back to home</Link>
    </div>
  );
}
