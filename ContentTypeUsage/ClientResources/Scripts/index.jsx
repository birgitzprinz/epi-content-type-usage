import { createRoot } from 'react-dom/client';
import App from './components/App';

const container = document.getElementById('content-type-usage-root');
if (container) {
  const pageTypes = JSON.parse(container.dataset.pageTypes || '[]');
  const blockTypes = JSON.parse(container.dataset.blockTypes || '[]');
  const labels = JSON.parse(container.dataset.labels || '{}');
  createRoot(container).render(
    <App pageTypes={pageTypes} blockTypes={blockTypes} labels={labels} />
  );
}
