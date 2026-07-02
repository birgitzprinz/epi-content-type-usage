import { useState, useEffect } from 'react';
import Pager from './Pager';
import { escapeHtml, formatString } from '../utils';

export default function ContentInstancesTable({
  data, page, pageSize, query, inputQuery, selectedTypeName,
  labels, loading, onPageChange, onSearch, onViewReferences,
}) {
  const [searchInput, setSearchInput] = useState(inputQuery ?? query);

  // Sync local input when inputQuery resets (e.g. Filter button clears the search)
  useEffect(() => {
    setSearchInput(inputQuery ?? '');
  }, [inputQuery]);

  function handleSearch(evt) {
    evt.preventDefault();
    onSearch(searchInput.trim());
  }

  function handleKeyPress(evt) {
    if (evt.key === 'Enter') handleSearch(evt);
  }

  // Hide the search bar during a filter-initiated load (loading=true, no in-flight query).
  // Keep it visible during a search-initiated load so the user can see what they searched for.
  const showSearch = !loading || !!inputQuery;

  const showBlockUsages = data?.isSelectedContentTypeBlockType;
  const start = data ? Math.min((page - 1) * pageSize + 1, data.total) : 0;
  const end = data ? Math.min(page * pageSize, data.total) : 0;

  const suggestion = data
    ? (query
      ? <span dangerouslySetInnerHTML={{ __html: formatString(labels.searchSuggestions, escapeHtml(query), data.total) }} />
      : <span dangerouslySetInnerHTML={{ __html: formatString(labels.contentInstanceSuggestions, data.total, escapeHtml(selectedTypeName || '')) }} />)
    : null;

  return (
    <div id="divContentInstances">
      <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
        <div className="ctu-suggestion" data-testid="content-instances-suggestion">
          {suggestion}
        </div>

        {showSearch && (
          <div className="input-group" style={{ width: 'auto' }}>
            <input
              name="txtContentInstancesSearch"
              type="text"
              id="txtContentInstancesSearch"
              className="form-control"
              placeholder={labels.search}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              id="btnContentInstancesSearch"
              title={labels.search}
              onClick={handleSearch}
            >
              {labels.search}
            </button>
          </div>
        )}
      </div>

      <div className="ctu-overlay-wrapper">
        {loading && (
          <div className="ctu-loading-overlay">
            <div className="spinner-border spinner-border-sm text-secondary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {data && (
          <>
            <table className="table table-bordered table-hover table-sm" id="tblContentInstances">
              <thead className="table-light">
                <tr>
                  <th scope="col">{labels.contentId}</th>
                  <th scope="col">{labels.name}</th>
                  {showBlockUsages && <th scope="col">{labels.usages}</th>}
                  <th scope="col">{labels.links}</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    {showBlockUsages && <td>{item.usages}</td>}
                    <td className="ctu-link-strip">
                      {item.viewLink && (
                        <a href={item.viewLink} target="_blank" rel="noreferrer" title={labels.viewTooltip}>
                          {labels.view}
                        </a>
                      )}
                      {item.editLink && (
                        <a href={item.editLink} target="_blank" rel="noreferrer" title={labels.editTooltip}>
                          {labels.edit}
                        </a>
                      )}
                      {item.isBlockType && item.usages !== 0 && (
                        <a
                          href="#"
                          title={labels.referencesTooltip}
                          onClick={(e) => { e.preventDefault(); onViewReferences(item); }}
                        >
                          {labels.references}
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="d-flex justify-content-between align-items-center flex-wrap">
              <Pager page={page} total={data.total} pageSize={pageSize} onPageChange={onPageChange} />
              {data.items.length > 0 && (
                <small className="text-muted">
                  <span dangerouslySetInnerHTML={{ __html: formatString(labels.itemsCount, start, end, data.total) }} />
                </small>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
