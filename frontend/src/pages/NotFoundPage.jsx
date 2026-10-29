import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <section aria-labelledby="page-title">
    <h1 id="page-title" className="text-2xl font-semibold">
      Page not found
    </h1>
    <p className="mt-2 text-muted">That address does not exist in FlowOps.</p>
    <Link to="/" className="mt-4 inline-block text-accent hover:underline">
      Back to dashboard
    </Link>
  </section>
);

export default NotFoundPage;
