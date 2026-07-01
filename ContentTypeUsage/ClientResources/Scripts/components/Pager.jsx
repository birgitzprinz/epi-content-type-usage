export default function Pager({ page, total, pageSize, onPageChange }) {
  if (!total || total <= pageSize) return null;

  const totalPages = Math.ceil(total / pageSize);
  const sectionIndex = Math.ceil(page / 10);
  const sectionStart = (sectionIndex - 1) * 10 + 1;
  const sectionEnd = Math.min(sectionIndex * 10, totalPages);

  return (
    <nav aria-label="Page navigation">
      <ul className="pagination pagination-sm mb-0">
        {sectionStart > 1 && (
          <li className="page-item">
            <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); onPageChange(sectionStart - 1); }}>
              &hellip;
            </a>
          </li>
        )}

        {Array.from({ length: sectionEnd - sectionStart + 1 }, (_, i) => sectionStart + i).map((p) =>
          p === page ? (
            <li key={p} className="page-item active" aria-current="page">
              <span className="page-link">{p}</span>
            </li>
          ) : (
            <li key={p} className="page-item">
              <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); onPageChange(p); }}>
                {p}
              </a>
            </li>
          )
        )}

        {sectionEnd < totalPages && (
          <li className="page-item">
            <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); onPageChange(sectionEnd + 1); }}>
              &hellip;
            </a>
          </li>
        )}
      </ul>
    </nav>
  );
}
