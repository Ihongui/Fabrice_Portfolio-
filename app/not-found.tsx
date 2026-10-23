import Link from "next/link";
export default function NotFound() { return <main className="shell page"><span className="eyebrow">404</span><h1>Page not found</h1><p className="lead">That page may have moved or is not available.</p><Link className="button" href="/en">Return to the portfolio</Link></main>; }
