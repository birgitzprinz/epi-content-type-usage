import { useState } from 'react';
import ContentTypeSelector from './ContentTypeSelector';
import ContentInstancesTable from './ContentInstancesTable';
import ReferencesModal from './ReferencesModal';

const PAGE_SIZE = 20;

export default function App({ pageTypes, blockTypes, labels }) {
  const [selectedType, setSelectedType] = useState(null);
  const [instancesData, setInstancesData] = useState(null);
  const [instancesPage, setInstancesPage] = useState(1);
  const [instancesQuery, setInstancesQuery] = useState('');
  const [instancesDisplayedQuery, setInstancesDisplayedQuery] = useState('');
  const [instancesLoading, setInstancesLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalBlock, setModalBlock] = useState(null);
  const [referencesData, setReferencesData] = useState(null);
  const [referencesPage, setReferencesPage] = useState(1);
  const [referencesQuery, setReferencesQuery] = useState('');
  const [referencesDisplayedQuery, setReferencesDisplayedQuery] = useState('');
  const [referencesLoading, setReferencesLoading] = useState(false);

  async function fetchInstances(typeId, page, query) {
    setInstancesLoading(true);
    setInstancesData(null);
    const qs = `/ContentTypeUsage/GetInstances?contentTypeId=${typeId}&page=${page}&pageSize=${PAGE_SIZE}${query ? '&query=' + encodeURIComponent(query) : ''}`;
    const res = await fetch(qs);
    const data = await res.json();
    setInstancesLoading(false);
    if (!data.status) { alert(data.message); return; }
    setInstancesDisplayedQuery(query);
    setInstancesData(data);
  }

  function handleFilter(typeId, typeName) {
    setSelectedType({ id: typeId, name: typeName });
    setInstancesQuery('');
    setInstancesDisplayedQuery('');
    setInstancesPage(1);
    fetchInstances(typeId, 1, '');
  }

  function handleInstancesPageChange(page) {
    setInstancesPage(page);
    fetchInstances(selectedType.id, page, instancesQuery);
  }

  function handleInstancesSearch(query) {
    setInstancesQuery(query);
    setInstancesPage(1);
    fetchInstances(selectedType.id, 1, query);
  }

  async function fetchReferences(blockId, page, query) {
    setReferencesLoading(true);
    setReferencesData(null);
    const qs = `/ContentTypeUsage/GetReferences?blockId=${blockId}&page=${page}&pageSize=${PAGE_SIZE}${query ? '&query=' + encodeURIComponent(query) : ''}`;
    const res = await fetch(qs);
    const data = await res.json();
    setReferencesLoading(false);
    if (!data.status) { alert(data.message); return; }
    setReferencesDisplayedQuery(query);
    setReferencesData(data);
  }

  function handleViewReferences(block) {
    setModalBlock(block);
    setReferencesQuery('');
    setReferencesDisplayedQuery('');
    setReferencesPage(1);
    setReferencesData(null);
    setModalOpen(true);
    fetchReferences(block.id, 1, '');
  }

  function handleReferencesPageChange(page) {
    setReferencesPage(page);
    fetchReferences(modalBlock.id, page, referencesQuery);
  }

  function handleReferencesSearch(query) {
    setReferencesQuery(query);
    setReferencesPage(1);
    fetchReferences(modalBlock.id, 1, query);
  }

  return (
    <div className="container-fluid py-3">
      <h2 className="h4 mb-1">{labels.displayName}</h2>
      <p className="text-muted mb-4">{labels.description}</p>

      <ContentTypeSelector
        pageTypes={pageTypes}
        blockTypes={blockTypes}
        labels={labels}
        onFilter={handleFilter}
        loading={instancesLoading}
      />

      {(instancesLoading || instancesData) && (
        <ContentInstancesTable
          data={instancesData}
          page={instancesPage}
          pageSize={PAGE_SIZE}
          query={instancesDisplayedQuery}
          inputQuery={instancesQuery}
          selectedTypeName={selectedType?.name}
          labels={labels}
          loading={instancesLoading}
          onPageChange={handleInstancesPageChange}
          onSearch={handleInstancesSearch}
          onViewReferences={handleViewReferences}
        />
      )}

      {modalOpen && (
        <ReferencesModal
          block={modalBlock}
          data={referencesData}
          page={referencesPage}
          pageSize={PAGE_SIZE}
          query={referencesDisplayedQuery}
          inputQuery={referencesQuery}
          labels={labels}
          loading={referencesLoading}
          onClose={() => setModalOpen(false)}
          onPageChange={handleReferencesPageChange}
          onSearch={handleReferencesSearch}
        />
      )}
    </div>
  );
}
