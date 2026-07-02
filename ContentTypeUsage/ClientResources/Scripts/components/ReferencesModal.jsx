import { useState, useEffect } from 'react';
import Pager from './Pager';
import { escapeHtml, formatString } from '../utils';

export default function ReferencesModal({
  block, data, page, pageSize, query, inputQuery, labels,
  loading, onClose, onPageChange, onSearch,
}) {
  const [searchInput, setSearchInput] = useState(inputQuery ?? query);

  // Sync local input when the modal is opened fresh (inputQuery resets to '')
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

  const start = data ? Math.min((page - 1) * pageSize + 1, data.total) : 0;
  const end = data ? Math.min(page * pageSize, data.total) : 0;

  const headerHtml = formatString(
    labels.modalDialogHeader,
    escapeHtml(block?.name || ''),
    block?.id ?? ''
  );

  const suggestion = data
    ? (query
      ? <span dangerouslySetInnerHTML={{ __html: formatString(labels.searchSuggestions, escapeHtml(query), data.total) }} />
      : <span dangerouslySetInnerHTML={{ __html: formatString(labels.contentReferencesSuggestions, data.total) }} />)
    : null;

  return (
    <>
      <div className="modal d-block ctu-modal" id="modalDataView" tabIndex="-1" aria-labelledby="modalHeader" aria-modal="true" role="dialog">
        <div className="modal-dialog modal-lg modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">

            <div className="modal-header">
              <p className="modal-title mb-0" id="modalHeader" dangerouslySetInnerHTML={{ __html: headerHtml }} />
              <button type="button" className="btn-close" aria-label={labels.close} onClick={onClose} />
            </div>

            <div className="modal-body" id="modalContent">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div className="ctu-suggestion" data-testid="content-references-suggestion">
                  {suggestion}
                </div>
                <div className="input-group" style={{ width: 'auto' }}>
                  <input
                    name="txtContentReferencesSearch"
                    type="text"
                    id="txtContentReferencesSearch"
                    className="form-control form-control-sm"
                    placeholder={labels.search}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    id="btnContentReferencesSearch"
                    title={labels.search}
                    onClick={handleSearch}
                  >
                    {labels.search}
                  </button>
                </div>
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
                    <table className="table table-bordered table-hover table-sm" id="tblContentReferences">
                      <thead className="table-light">
                        <tr>
                          <th scope="col">{labels.contentId}</th>
                          <th scope="col">{labels.name}</th>
                          <th scope="col">{labels.links}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.items.map((item) => (
                          <tr key={`${item.id}-${item.name}`}>
                            <td>{item.id}</td>
                            <td>{item.name}</td>
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

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} aria-label={labels.close}>
                {labels.close}
              </button>
            </div>

          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose} />
    </>
  );
}
