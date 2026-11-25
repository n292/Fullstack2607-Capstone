import React, { useEffect, useState } from "react";

const PAGE_SIZE = 3;

function ItemCard({ item }) {
  const hasReviews = item.reviewCount > 0;

  return (
    <article className="item-card">
      <span className="category">{item.category}</span>

      <h2>{item.title}</h2>

      <p className="description">{item.description}</p>

      <div className="rating">
        {hasReviews ? (
          <>
            <span
              className="rating-score"
              aria-label={`${item.averageRating} out of 5 stars`}
            >
              <span aria-hidden="true">★ </span>
              {item.averageRating.toFixed(1)}
              <span className="rating-scale" aria-hidden="true">
                {" / 5"}
              </span>
            </span>

            <span className="review-count">
              {item.reviewCount}{" "}
              {item.reviewCount === 1 ? "review" : "reviews"}
            </span>
          </>
        ) : (
          <span className="review-count">No reviews yet</span>
        )}
      </div>
    </article>
  );
}

export default function App() {
  const [page, setPage] = useState(1);
  const [retryCount, setRetryCount] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadItems() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/items?page=${page}&limit=${PAGE_SIZE}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(
            "We couldn't load the catalog. Please try again."
          );
        }

        const result = await response.json();

        if (!controller.signal.aborted) {
          setData(result);
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(
            requestError.message ||
              "We couldn't load the catalog. Please try again."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadItems();

    return () => controller.abort();
  }, [page, retryCount]);

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to catalog
      </a>

      <header className="site-header">
        <div className="container header-content">
          <a className="brand" href="/">
            ReviewHub
          </a>

          <nav aria-label="Main navigation">
            <a href="/" aria-current="page">
              Browse
            </a>
          </nav>
        </div>
      </header>

      <main id="main" className="container">
        <section className="intro" aria-labelledby="catalog-heading">
          <p className="eyebrow">Community catalog</p>
          <h1 id="catalog-heading">Explore what people are reviewing.</h1>
          <p>
            Browse movies, books, products, and places.
            This starter catalog uses sample reviews.
          </p>
        </section>

        <section
          aria-label="Browse items"
          aria-busy={loading}
          className="catalog"
        >
          {loading && (
            <p className="message" role="status">
              Loading items…
            </p>
          )}

          {!loading && error && (
            <div className="message">
              <p role="alert">{error}</p>
              <button
                type="button"
                onClick={() => setRetryCount((count) => count + 1)}
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="message" role="status">
              <h2>
                {pagination?.total === 0
                  ? "No items yet"
                  : "No items on this page"}
              </h2>

              <p>
                {pagination?.total === 0
                  ? "Items will appear here once they are added."
                  : "Return to the first page to browse the catalog."}
              </p>

              {page > 1 && (
                <button type="button" onClick={() => setPage(1)}>
                  Back to first page
                </button>
              )}
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <>
              <p className="results" role="status">
                Showing {(pagination.page - 1) * pagination.limit + 1}
                {"–"}
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.total
                )}{" "}
                of {pagination.total} items
              </p>

              <div className="item-grid">
                {items.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </>
          )}

          {!error && pagination && pagination.totalPages > 1 && (
            <nav className="pagination" aria-label="Catalog pages">
              <button
                type="button"
                disabled={loading || page === 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </button>

              <span>
                Page {page} of {pagination.totalPages}
              </span>

              <button
                type="button"
                disabled={loading || page >= pagination.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </button>
            </nav>
          )}
        </section>
      </main>

      <footer className="container site-footer">
        ReviewHub · Movies, books, products, and places
      </footer>
    </>
  );
}