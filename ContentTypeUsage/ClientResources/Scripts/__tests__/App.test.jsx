import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../components/App';

const labels = {
  displayName: 'Content Type Usage',
  description: 'Use the filter button below to search for usages.',
  contentType: 'Content Type',
  filter: 'Filter',
  search: 'Search',
  close: 'Close',
  contentId: 'Content ID',
  name: 'Name',
  usages: 'Usages',
  links: 'Links',
  edit: 'Edit',
  view: 'View',
  references: 'References',
  editTooltip: 'Edit',
  viewTooltip: 'View',
  referencesTooltip: 'View references',
  contentInstanceSuggestions: 'There are currently <b>{0}</b> instance(s) of <b>{1}</b>.',
  modalDialogHeader: 'Reference(s) of block <b>"{0}"</b> with ID <b>"{1}"</b>.',
  contentReferencesSuggestions: 'There are currently <b>{0}</b> content(s) linked to this block.',
  searchSuggestions: 'Your search for <b>{0}</b> returned <b>{1}</b> items.',
  itemsCount: 'Displaying items {0}-{1} of {2}',
  pageTypesHeading: 'Page Types',
  blockTypesHeading: 'Block Types',
  selectPlaceholder: '-- Select --',
};

const pageTypes = [{ value: '1', text: 'Article Page' }];
const blockTypes = [{ value: '10', text: 'Hero Block' }];

const blockInstancesResponse = {
  status: true,
  page: 1,
  pageSize: 20,
  total: 1,
  items: [
    { id: 219776, name: 'Wish List Settings', viewLink: null, editLink: '/cms/edit#219776', isBlockType: true, usages: 1 },
  ],
  isSelectedContentTypeBlockType: true,
};

const referencesResponse = {
  status: true,
  page: 1,
  pageSize: 20,
  total: 1,
  items: [
    { id: 100, name: 'Home Page (en-GB)', viewLink: 'https://example.com/', editLink: '/cms/edit#100', isBlockType: false },
  ],
  isSelectedContentTypeBlockType: false,
};

const pageInstancesResponse = {
  status: true,
  page: 1,
  pageSize: 20,
  total: 1,
  items: [
    { id: 50, name: 'Article: Gardening Tips', viewLink: 'https://example.com/gardening', editLink: '/cms/edit#50', isBlockType: false, usages: 1 },
  ],
  isSelectedContentTypeBlockType: false,
};

function mockFetch(responses) {
  let callIndex = 0;
  global.fetch = jest.fn(() => {
    const response = responses[callIndex] ?? responses[responses.length - 1];
    callIndex++;
    return Promise.resolve({
      json: () => Promise.resolve(response),
    });
  });
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('App', () => {
  test('renders heading and description', () => {
    render(<App pageTypes={pageTypes} blockTypes={blockTypes} labels={labels} />);
    expect(screen.getByText('Content Type Usage')).toBeInTheDocument();
    expect(screen.getByText(/Use the filter button below/i)).toBeInTheDocument();
  });

  test('does not show the instances table before filtering', () => {
    render(<App pageTypes={pageTypes} blockTypes={blockTypes} labels={labels} />);
    expect(screen.queryByText('Content ID')).toBeNull();
  });

  test('fetches and displays instances after selecting a block type and clicking Filter', async () => {
    const user = userEvent.setup();
    mockFetch([blockInstancesResponse]);

    render(<App pageTypes={pageTypes} blockTypes={blockTypes} labels={labels} />);

    await user.selectOptions(screen.getByRole('combobox'), '10');
    await user.click(screen.getByRole('button', { name: 'Filter' }));

    await waitFor(() => expect(screen.getByText('Wish List Settings')).toBeInTheDocument());
    expect(screen.getByText('219776')).toBeInTheDocument();
    expect(screen.getByText('Usages')).toBeInTheDocument();
  });

  test('fetches and displays instances for a page type (no Usages column)', async () => {
    const user = userEvent.setup();
    mockFetch([pageInstancesResponse]);

    render(<App pageTypes={pageTypes} blockTypes={blockTypes} labels={labels} />);

    await user.selectOptions(screen.getByRole('combobox'), '1');
    await user.click(screen.getByRole('button', { name: 'Filter' }));

    await waitFor(() => expect(screen.getByText('Article: Gardening Tips')).toBeInTheDocument());
    expect(screen.queryByText('Usages')).toBeNull();
  });

  test('sends the correct URL when fetching instances', async () => {
    const user = userEvent.setup();
    mockFetch([blockInstancesResponse]);

    render(<App pageTypes={pageTypes} blockTypes={blockTypes} labels={labels} />);

    await user.selectOptions(screen.getByRole('combobox'), '10');
    await user.click(screen.getByRole('button', { name: 'Filter' }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const url = global.fetch.mock.calls[0][0];
    expect(url).toContain('contentTypeId=10');
    expect(url).toContain('page=1');
    expect(url).toContain('pageSize=20');
  });

  test('opens modal and fetches references when References link is clicked', async () => {
    const user = userEvent.setup();
    mockFetch([blockInstancesResponse, referencesResponse]);

    render(<App pageTypes={pageTypes} blockTypes={blockTypes} labels={labels} />);

    await user.selectOptions(screen.getByRole('combobox'), '10');
    await user.click(screen.getByRole('button', { name: 'Filter' }));
    await waitFor(() => expect(screen.getByRole('link', { name: 'References' })).toBeInTheDocument());

    await user.click(screen.getByRole('link', { name: 'References' }));
    await waitFor(() => expect(screen.getByText('Home Page (en-GB)')).toBeInTheDocument());
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('modal header contains block name and id', async () => {
    const user = userEvent.setup();
    mockFetch([blockInstancesResponse, referencesResponse]);

    render(<App pageTypes={pageTypes} blockTypes={blockTypes} labels={labels} />);

    await user.selectOptions(screen.getByRole('combobox'), '10');
    await user.click(screen.getByRole('button', { name: 'Filter' }));
    await waitFor(() => screen.getByRole('link', { name: 'References' }));

    await user.click(screen.getByRole('link', { name: 'References' }));
    await waitFor(() => screen.getByRole('dialog'));

    const header = document.getElementById('modalHeader');
    expect(header.innerHTML).toContain('Wish List Settings');
    expect(header.innerHTML).toContain('219776');
  });

  test('closes modal when the close button is clicked', async () => {
    const user = userEvent.setup();
    mockFetch([blockInstancesResponse, referencesResponse]);

    render(<App pageTypes={pageTypes} blockTypes={blockTypes} labels={labels} />);

    await user.selectOptions(screen.getByRole('combobox'), '10');
    await user.click(screen.getByRole('button', { name: 'Filter' }));
    await waitFor(() => screen.getByRole('link', { name: 'References' }));

    await user.click(screen.getByRole('link', { name: 'References' }));
    await waitFor(() => screen.getByRole('dialog'));

    const closeButtons = screen.getAllByRole('button', { name: 'Close' });
    await user.click(closeButtons[0]);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  test('re-fetches instances when search is submitted', async () => {
    const user = userEvent.setup();
    const searchResponse = {
      ...blockInstancesResponse,
      total: 0,
      items: [],
    };
    mockFetch([blockInstancesResponse, searchResponse]);

    render(<App pageTypes={pageTypes} blockTypes={blockTypes} labels={labels} />);

    await user.selectOptions(screen.getByRole('combobox'), '10');
    await user.click(screen.getByRole('button', { name: 'Filter' }));
    await waitFor(() => screen.getByText('Wish List Settings'));

    await user.type(screen.getByRole('textbox'), 'something');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
    const searchUrl = global.fetch.mock.calls[1][0];
    expect(searchUrl).toContain('query=something');
  });

  test('hides search bar while filter AJAX request is in flight', async () => {
    const user = userEvent.setup();
    let resolveJson;
    global.fetch = jest.fn(() => Promise.resolve({
      json: () => new Promise((res) => { resolveJson = res; }),
    }));

    render(<App pageTypes={pageTypes} blockTypes={blockTypes} labels={labels} />);

    await user.selectOptions(screen.getByRole('combobox'), '10');
    await user.click(screen.getByRole('button', { name: 'Filter' }));

    // While the request is still pending the search bar must be hidden
    expect(screen.queryByRole('button', { name: 'Search' })).toBeNull();
    expect(screen.queryByRole('textbox')).toBeNull();

    // Resolve the fetch so React can clean up
    resolveJson(blockInstancesResponse);
    await waitFor(() => screen.getByText('Wish List Settings'));
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  test('keeps search bar visible when search returns no results', async () => {
    const user = userEvent.setup();
    const emptyResponse = { ...blockInstancesResponse, total: 0, items: [] };
    mockFetch([blockInstancesResponse, emptyResponse]);

    render(<App pageTypes={pageTypes} blockTypes={blockTypes} labels={labels} />);

    await user.selectOptions(screen.getByRole('combobox'), '10');
    await user.click(screen.getByRole('button', { name: 'Filter' }));
    await waitFor(() => screen.getByText('Wish List Settings'));

    await user.type(screen.getByRole('textbox'), 'nomatch');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('shows alert when API returns status false', async () => {
    const user = userEvent.setup();
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    mockFetch([{ status: false, message: 'Something went wrong' }]);

    render(<App pageTypes={pageTypes} blockTypes={blockTypes} labels={labels} />);

    await user.selectOptions(screen.getByRole('combobox'), '10');
    await user.click(screen.getByRole('button', { name: 'Filter' }));

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Something went wrong'));
  });
});
