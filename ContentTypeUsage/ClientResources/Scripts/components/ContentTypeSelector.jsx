import { useState } from 'react';

export default function ContentTypeSelector({ pageTypes, blockTypes, labels, onFilter, loading }) {
  const [selectedId, setSelectedId] = useState('');
  const [selectedName, setSelectedName] = useState('');

  function handleChange(e) {
    setSelectedId(e.target.value);
    setSelectedName(e.target.options[e.target.selectedIndex].text);
  }

  function handleFilter(evt) {
    evt.preventDefault();
    if (!selectedId) return;
    onFilter(selectedId, selectedName);
  }

  return (
    <div className="row g-2 align-items-end mb-4">
      <div className="col-auto">
        <label htmlFor="ddlContentType" className="form-label fw-semibold">
          {labels.contentType}
        </label>
        <select
          className="form-select"
          id="ddlContentType"
          name="ContentType"
          value={selectedId}
          onChange={handleChange}
        >
          <option value="" disabled>{labels.selectPlaceholder || '-- Select --'}</option>
          <optgroup label={labels.pageTypesHeading}>
            {pageTypes.map((pt) => (
              <option key={pt.value} value={pt.value}>{pt.text}</option>
            ))}
          </optgroup>
          <optgroup label={labels.blockTypesHeading}>
            {blockTypes.map((bt) => (
              <option key={bt.value} value={bt.value}>{bt.text}</option>
            ))}
          </optgroup>
        </select>
      </div>
      <div className="col-auto">
        <button
          type="button"
          className="btn btn-primary"
          id="btnFilter"
          title={labels.filter}
          disabled={loading || !selectedId}
          onClick={handleFilter}
        >
          {loading
            ? <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />{labels.filter}</>
            : labels.filter}
        </button>
      </div>
    </div>
  );
}
