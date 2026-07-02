import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReferencesModal from '../components/ReferencesModal';

const labels = {
  contentId: 'Content ID',
  name: 'Name',
  links: 'Links',
  search: 'Search',
  close: 'Close',
  view: 'View',
  edit: 'Edit',
  viewTooltip: 'View this item',
  editTooltip: 'Edit this item',
  modalDialogHeader: 'Reference(s) of block <b>"{0}"</b> with ID <b>"{1}"</b>.',
  contentReferencesSuggestions: 'There are currently <b>{0}</b> content(s) linked to this block.',
  searchSuggestions: 'Your search for <b>{0}</b> returned <b>{1}</b> items.',
  itemsCount: 'Displaying items {0}-{1} of {2}',
};

const block = { id: 219776, name: 'Wish List Settings' };

const referenceItem = {
  id: 100,
  name: 'Home Page (en-GB)',
  viewLink: 'https://example.com/',
  editLink: '/cms/edit#100',
  isBlockType: false,
};

function makeData(items, overrides = {}) {
  return {
    status: true,
    page: 1,
    pageSize: 20,
    total: items.length,
    items,
    ...overrides,
  };
}

const noop = () => {};

describe('ReferencesModal', () => {
  describe('modal header', () => {
    test('renders the block name and id in the header', () => {
      render(
        <ReferencesModal
          block={block} data={makeData([referenceItem])} page={1} pageSize={20}
          query="" labels={labels} loading={false}
          onClose={noop} onPageChange={noop} onSearch={noop}
        />
      );
      const header = document.getElementById('modalHeader');
      expect(header.innerHTML).toContain('Wish List Settings');
      expect(header.innerHTML).toContain('219776');
    });

    test('escapes html in the block name in the header', () => {
      const xssBlock = { id: 1, name: '<script>alert(1)</script>' };
      render(
        <ReferencesModal
          block={xssBlock} data={makeData([])} page={1} pageSize={20}
          query="" labels={labels} loading={false}
          onClose={noop} onPageChange={noop} onSearch={noop}
        />
      );
      const header = document.getElementById('modalHeader');
      expect(header.innerHTML).not.toContain('<script>');
      expect(header.innerHTML).toContain('&lt;script&gt;');
    });
  });

  describe('loading state', () => {
    test('shows loading indicator when loading is true and data is null', () => {
      render(
        <ReferencesModal
          block={block} data={null} page={1} pageSize={20}
          query="" labels={labels} loading={true}
          onClose={noop} onPageChange={noop} onSearch={noop}
        />
      );
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('does not show loading indicator when loading is false', () => {
      render(
        <ReferencesModal
          block={block} data={makeData([referenceItem])} page={1} pageSize={20}
          query="" labels={labels} loading={false}
          onClose={noop} onPageChange={noop} onSearch={noop}
        />
      );
      expect(screen.queryByText('Loading...')).toBeNull();
    });
  });

  describe('table', () => {
    test('renders Content ID, Name and Links headers', () => {
      render(
        <ReferencesModal
          block={block} data={makeData([referenceItem])} page={1} pageSize={20}
          query="" labels={labels} loading={false}
          onClose={noop} onPageChange={noop} onSearch={noop}
        />
      );
      expect(screen.getByText('Content ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Links')).toBeInTheDocument();
    });

    test('renders reference item id and name', () => {
      render(
        <ReferencesModal
          block={block} data={makeData([referenceItem])} page={1} pageSize={20}
          query="" labels={labels} loading={false}
          onClose={noop} onPageChange={noop} onSearch={noop}
        />
      );
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('Home Page (en-GB)')).toBeInTheDocument();
    });

    test('renders View and Edit links for a reference item', () => {
      render(
        <ReferencesModal
          block={block} data={makeData([referenceItem])} page={1} pageSize={20}
          query="" labels={labels} loading={false}
          onClose={noop} onPageChange={noop} onSearch={noop}
        />
      );
      expect(screen.getByRole('link', { name: 'View' })).toHaveAttribute('href', referenceItem.viewLink);
      expect(screen.getByRole('link', { name: 'Edit' })).toHaveAttribute('href', referenceItem.editLink);
    });

    test('does not render table when data is null', () => {
      render(
        <ReferencesModal
          block={block} data={null} page={1} pageSize={20}
          query="" labels={labels} loading={false}
          onClose={noop} onPageChange={noop} onSearch={noop}
        />
      );
      expect(screen.queryByRole('table')).toBeNull();
    });
  });

  describe('suggestion text', () => {
    test('shows references count suggestion when query is empty', () => {
      render(
        <ReferencesModal
          block={block} data={makeData([referenceItem])} page={1} pageSize={20}
          query="" labels={labels} loading={false}
          onClose={noop} onPageChange={noop} onSearch={noop}
        />
      );
      const suggestion = screen.getByTestId('content-references-suggestion');
      expect(suggestion.textContent).toMatch(/1.*content/i);
    });

    test('shows search result suggestion when query is set', () => {
      render(
        <ReferencesModal
          block={block} data={makeData([referenceItem])} page={1} pageSize={20}
          query="home" labels={labels} loading={false}
          onClose={noop} onPageChange={noop} onSearch={noop}
        />
      );
      const suggestion = screen.getByTestId('content-references-suggestion');
      expect(suggestion.textContent).toMatch(/home/i);
    });
  });

  describe('item count', () => {
    test('renders item count when there are results', () => {
      render(
        <ReferencesModal
          block={block} data={makeData([referenceItem], { total: 1 })} page={1} pageSize={20}
          query="" labels={labels} loading={false}
          onClose={noop} onPageChange={noop} onSearch={noop}
        />
      );
      expect(screen.getByText(/Displaying items 1-1 of 1/)).toBeInTheDocument();
    });
  });

  describe('close behaviour', () => {
    test('calls onClose when the close button in the header is clicked', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(
        <ReferencesModal
          block={block} data={makeData([referenceItem])} page={1} pageSize={20}
          query="" labels={labels} loading={false}
          onClose={onClose} onPageChange={noop} onSearch={noop}
        />
      );
      const closeButtons = screen.getAllByRole('button', { name: 'Close' });
      await user.click(closeButtons[0]);
      expect(onClose).toHaveBeenCalled();
    });

    test('calls onClose when the footer Close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(
        <ReferencesModal
          block={block} data={makeData([referenceItem])} page={1} pageSize={20}
          query="" labels={labels} loading={false}
          onClose={onClose} onPageChange={noop} onSearch={noop}
        />
      );
      const closeButtons = screen.getAllByRole('button', { name: 'Close' });
      await user.click(closeButtons[closeButtons.length - 1]);
      expect(onClose).toHaveBeenCalled();
    });

    test('calls onClose when the overlay backdrop is clicked', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(
        <ReferencesModal
          block={block} data={makeData([referenceItem])} page={1} pageSize={20}
          query="" labels={labels} loading={false}
          onClose={onClose} onPageChange={noop} onSearch={noop}
        />
      );
      fireEvent.click(document.querySelector('.modal-backdrop'));
      expect(onClose).toHaveBeenCalled();
    });

    test('does not call onClose when clicking inside the modal container', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(
        <ReferencesModal
          block={block} data={makeData([referenceItem])} page={1} pageSize={20}
          query="" labels={labels} loading={false}
          onClose={onClose} onPageChange={noop} onSearch={noop}
        />
      );
      await user.click(document.querySelector('.modal-dialog'));
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('search', () => {
    test('calls onSearch with trimmed input when Search is clicked', async () => {
      const user = userEvent.setup();
      const onSearch = jest.fn();
      render(
        <ReferencesModal
          block={block} data={makeData([referenceItem])} page={1} pageSize={20}
          query="" labels={labels} loading={false}
          onClose={noop} onPageChange={noop} onSearch={onSearch}
        />
      );
      await user.type(screen.getByRole('textbox'), '  home  ');
      await user.click(screen.getByRole('button', { name: 'Search' }));
      expect(onSearch).toHaveBeenCalledWith('home');
    });

    test('calls onSearch when Enter is pressed in the search input', async () => {
      const user = userEvent.setup();
      const onSearch = jest.fn();
      render(
        <ReferencesModal
          block={block} data={makeData([referenceItem])} page={1} pageSize={20}
          query="" labels={labels} loading={false}
          onClose={noop} onPageChange={noop} onSearch={onSearch}
        />
      );
      await user.type(screen.getByRole('textbox'), 'home{Enter}');
      expect(onSearch).toHaveBeenCalledWith('home');
    });
  });
});
