import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContentInstancesTable from '../components/ContentInstancesTable';

const labels = {
  contentId: 'Content ID',
  name: 'Name',
  usages: 'Usages',
  links: 'Links',
  search: 'Search',
  view: 'View',
  edit: 'Edit',
  references: 'References',
  viewTooltip: 'View this item',
  editTooltip: 'Edit this item',
  referencesTooltip: 'View block references',
  contentInstanceSuggestions: 'There are currently <b>{0}</b> instance(s) of <b>{1}</b>.',
  searchSuggestions: 'Your search for <b>{0}</b> returned <b>{1}</b> items.',
  itemsCount: 'Displaying items {0}-{1} of {2}',
};

const blockItem = {
  id: 219776,
  name: 'Wish List Settings',
  viewLink: null,
  editLink: '/cms/edit#219776',
  isBlockType: true,
  usages: 1,
};

const pageItem = {
  id: 100,
  name: 'Home Page',
  viewLink: 'https://example.com/',
  editLink: '/cms/edit#100',
  isBlockType: false,
  usages: 1,
};

function makeData(items, overrides = {}) {
  return {
    status: true,
    page: 1,
    pageSize: 20,
    total: items.length,
    items,
    isSelectedContentTypeBlockType: false,
    ...overrides,
  };
}

const noop = () => {};

describe('ContentInstancesTable', () => {
  describe('table headers', () => {
    test('renders Content ID, Name and Links headers always', () => {
      render(
        <ContentInstancesTable
          data={makeData([pageItem])}
          page={1} pageSize={20} query="" selectedTypeName="Article Page"
          labels={labels} loading={false} onPageChange={noop} onSearch={noop} onViewReferences={noop}
        />
      );
      expect(screen.getByText('Content ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Links')).toBeInTheDocument();
    });

    test('does not render Usages header for page types', () => {
      render(
        <ContentInstancesTable
          data={makeData([pageItem], { isSelectedContentTypeBlockType: false })}
          page={1} pageSize={20} query="" selectedTypeName="Article Page"
          labels={labels} loading={false} onPageChange={noop} onSearch={noop} onViewReferences={noop}
        />
      );
      expect(screen.queryByText('Usages')).toBeNull();
    });

    test('renders Usages header for block types', () => {
      render(
        <ContentInstancesTable
          data={makeData([blockItem], { isSelectedContentTypeBlockType: true })}
          page={1} pageSize={20} query="" selectedTypeName="Hero Block"
          labels={labels} loading={false} onPageChange={noop} onSearch={noop} onViewReferences={noop}
        />
      );
      expect(screen.getByText('Usages')).toBeInTheDocument();
    });
  });

  describe('table rows', () => {
    test('renders item id and name in the row', () => {
      render(
        <ContentInstancesTable
          data={makeData([blockItem], { isSelectedContentTypeBlockType: true })}
          page={1} pageSize={20} query="" selectedTypeName="Hero Block"
          labels={labels} loading={false} onPageChange={noop} onSearch={noop} onViewReferences={noop}
        />
      );
      expect(screen.getByText('219776')).toBeInTheDocument();
      expect(screen.getByText('Wish List Settings')).toBeInTheDocument();
    });

    test('renders usages count in row when block type', () => {
      render(
        <ContentInstancesTable
          data={makeData([blockItem], { isSelectedContentTypeBlockType: true })}
          page={1} pageSize={20} query="" selectedTypeName="Hero Block"
          labels={labels} loading={false} onPageChange={noop} onSearch={noop} onViewReferences={noop}
        />
      );
      const rows = screen.getAllByRole('row');
      const dataRow = rows.find(r => within(r).queryByText('219776'));
      expect(within(dataRow).getByText('1')).toBeInTheDocument();
    });

    test('renders Edit link when editLink is present', () => {
      render(
        <ContentInstancesTable
          data={makeData([blockItem], { isSelectedContentTypeBlockType: true })}
          page={1} pageSize={20} query="" selectedTypeName="Hero Block"
          labels={labels} loading={false} onPageChange={noop} onSearch={noop} onViewReferences={noop}
        />
      );
      const editLink = screen.getByRole('link', { name: 'Edit' });
      expect(editLink).toHaveAttribute('href', blockItem.editLink);
      expect(editLink).toHaveAttribute('target', '_blank');
    });

    test('does not render View link when viewLink is null', () => {
      render(
        <ContentInstancesTable
          data={makeData([blockItem], { isSelectedContentTypeBlockType: true })}
          page={1} pageSize={20} query="" selectedTypeName="Hero Block"
          labels={labels} loading={false} onPageChange={noop} onSearch={noop} onViewReferences={noop}
        />
      );
      expect(screen.queryByRole('link', { name: 'View' })).toBeNull();
    });

    test('renders View link when viewLink is present', () => {
      render(
        <ContentInstancesTable
          data={makeData([pageItem])}
          page={1} pageSize={20} query="" selectedTypeName="Article Page"
          labels={labels} loading={false} onPageChange={noop} onSearch={noop} onViewReferences={noop}
        />
      );
      const viewLink = screen.getByRole('link', { name: 'View' });
      expect(viewLink).toHaveAttribute('href', pageItem.viewLink);
    });

    test('renders References link for a block item with usages > 0', () => {
      render(
        <ContentInstancesTable
          data={makeData([blockItem], { isSelectedContentTypeBlockType: true })}
          page={1} pageSize={20} query="" selectedTypeName="Hero Block"
          labels={labels} loading={false} onPageChange={noop} onSearch={noop} onViewReferences={noop}
        />
      );
      expect(screen.getByRole('link', { name: 'References' })).toBeInTheDocument();
    });

    test('does not render References link for a block item with 0 usages', () => {
      const zeroUsageBlock = { ...blockItem, usages: 0 };
      render(
        <ContentInstancesTable
          data={makeData([zeroUsageBlock], { isSelectedContentTypeBlockType: true })}
          page={1} pageSize={20} query="" selectedTypeName="Hero Block"
          labels={labels} loading={false} onPageChange={noop} onSearch={noop} onViewReferences={noop}
        />
      );
      expect(screen.queryByRole('link', { name: 'References' })).toBeNull();
    });

    test('does not render References link for a page item', () => {
      render(
        <ContentInstancesTable
          data={makeData([pageItem])}
          page={1} pageSize={20} query="" selectedTypeName="Article Page"
          labels={labels} loading={false} onPageChange={noop} onSearch={noop} onViewReferences={noop}
        />
      );
      expect(screen.queryByRole('link', { name: 'References' })).toBeNull();
    });

    test('calls onViewReferences with the item when References is clicked', async () => {
      const user = userEvent.setup();
      const onViewReferences = jest.fn();
      render(
        <ContentInstancesTable
          data={makeData([blockItem], { isSelectedContentTypeBlockType: true })}
          page={1} pageSize={20} query="" selectedTypeName="Hero Block"
          labels={labels} loading={false} onPageChange={noop} onSearch={noop} onViewReferences={onViewReferences}
        />
      );
      await user.click(screen.getByRole('link', { name: 'References' }));
      expect(onViewReferences).toHaveBeenCalledWith(blockItem);
    });
  });

  describe('suggestion text', () => {
    test('shows instance count suggestion when query is empty', () => {
      render(
        <ContentInstancesTable
          data={makeData([blockItem], { isSelectedContentTypeBlockType: true })}
          page={1} pageSize={20} query="" selectedTypeName="Hero Block"
          labels={labels} loading={false} onPageChange={noop} onSearch={noop} onViewReferences={noop}
        />
      );
      const suggestion = screen.getByTestId('content-instances-suggestion');
      expect(suggestion.textContent).toMatch(/1.*instance/i);
      expect(suggestion.textContent).toContain('Hero Block');
    });

    test('shows search result suggestion when query is set', () => {
      render(
        <ContentInstancesTable
          data={makeData([blockItem], { isSelectedContentTypeBlockType: true })}
          page={1} pageSize={20} query="wish" selectedTypeName="Hero Block"
          labels={labels} loading={false} onPageChange={noop} onSearch={noop} onViewReferences={noop}
        />
      );
      const suggestion = screen.getByTestId('content-instances-suggestion');
      expect(suggestion.textContent).toMatch(/wish/i);
    });
  });

  describe('item count display', () => {
    test('renders item count when there are results', () => {
      render(
        <ContentInstancesTable
          data={makeData([blockItem], { total: 1 })}
          page={1} pageSize={20} query="" selectedTypeName="Hero Block"
          labels={labels} loading={false} onPageChange={noop} onSearch={noop} onViewReferences={noop}
        />
      );
      expect(screen.getByText(/Displaying items 1-1 of 1/)).toBeInTheDocument();
    });
  });

  describe('search', () => {
    test('renders the search input and button when there are items', () => {
      render(
        <ContentInstancesTable
          data={makeData([blockItem], { isSelectedContentTypeBlockType: true })}
          page={1} pageSize={20} query="" selectedTypeName="Hero Block"
          labels={labels} loading={false} onPageChange={noop} onSearch={noop} onViewReferences={noop}
        />
      );
      expect(screen.getByRole('textbox', { name: '' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
    });

    test('renders the search bar even when items list is empty', () => {
      render(
        <ContentInstancesTable
          data={makeData([], { total: 0 })}
          page={1} pageSize={20} query="" selectedTypeName="Hero Block"
          labels={labels} loading={false} onPageChange={noop} onSearch={noop} onViewReferences={noop}
        />
      );
      expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
    });

    test('hides search bar when loading is true and inputQuery is empty (filter load)', () => {
      render(
        <ContentInstancesTable
          data={null}
          page={1} pageSize={20} query="" inputQuery="" selectedTypeName="Hero Block"
          labels={labels} loading={true} onPageChange={noop} onSearch={noop} onViewReferences={noop}
        />
      );
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByRole('table')).toBeNull();
      expect(screen.queryByRole('button', { name: 'Search' })).toBeNull();
      expect(screen.queryByRole('textbox')).toBeNull();
    });

    test('keeps search bar visible when loading is true and inputQuery is set (search load)', () => {
      render(
        <ContentInstancesTable
          data={null}
          page={1} pageSize={20} query="" inputQuery="hero" selectedTypeName="Hero Block"
          labels={labels} loading={true} onPageChange={noop} onSearch={noop} onViewReferences={noop}
        />
      );
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    test('resets search input when inputQuery changes to empty string', async () => {
      const { rerender } = render(
        <ContentInstancesTable
          data={makeData([blockItem], { isSelectedContentTypeBlockType: true })}
          page={1} pageSize={20} query="" inputQuery="hero" selectedTypeName="Hero Block"
          labels={labels} loading={false} onPageChange={noop} onSearch={noop} onViewReferences={noop}
        />
      );
      expect(screen.getByRole('textbox').value).toBe('hero');
      rerender(
        <ContentInstancesTable
          data={makeData([blockItem], { isSelectedContentTypeBlockType: true })}
          page={1} pageSize={20} query="" inputQuery="" selectedTypeName="Hero Block"
          labels={labels} loading={false} onPageChange={noop} onSearch={noop} onViewReferences={noop}
        />
      );
      expect(screen.getByRole('textbox').value).toBe('');
    });

    test('calls onSearch with trimmed input when Search is clicked', async () => {
      const user = userEvent.setup();
      const onSearch = jest.fn();
      render(
        <ContentInstancesTable
          data={makeData([blockItem], { isSelectedContentTypeBlockType: true })}
          page={1} pageSize={20} query="" selectedTypeName="Hero Block"
          labels={labels} loading={false} onPageChange={noop} onSearch={onSearch} onViewReferences={noop}
        />
      );
      await user.type(screen.getByRole('textbox'), '  wish list  ');
      await user.click(screen.getByRole('button', { name: 'Search' }));
      expect(onSearch).toHaveBeenCalledWith('wish list');
    });

    test('calls onSearch when Enter is pressed in the search input', async () => {
      const user = userEvent.setup();
      const onSearch = jest.fn();
      render(
        <ContentInstancesTable
          data={makeData([blockItem], { isSelectedContentTypeBlockType: true })}
          page={1} pageSize={20} query="" selectedTypeName="Hero Block"
          labels={labels} loading={false} onPageChange={noop} onSearch={onSearch} onViewReferences={noop}
        />
      );
      await user.type(screen.getByRole('textbox'), 'hero{Enter}');
      expect(onSearch).toHaveBeenCalledWith('hero');
    });
  });
});
