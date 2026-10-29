const PlaceholderPage = ({ title }) => (
  <section aria-labelledby="page-title">
    <h1 id="page-title" className="text-2xl font-semibold">
      {title}
    </h1>
    <p className="mt-2 text-muted">This page is not built yet.</p>
  </section>
);

export default PlaceholderPage;
