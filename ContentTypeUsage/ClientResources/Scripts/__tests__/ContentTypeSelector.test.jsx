import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContentTypeSelector from '../components/ContentTypeSelector';

const pageTypes = [
  { value: '1', text: 'Article Page' },
  { value: '2', text: 'Landing Page' },
];

const blockTypes = [
  { value: '10', text: 'Hero Block' },
  { value: '11', text: 'Teaser Block' },
];

const labels = {
  contentType: 'Content Type',
  filter: 'Filter',
  pageTypesHeading: 'Page Types',
  blockTypesHeading: 'Block Types',
  selectPlaceholder: '-- Select --',
};

describe('ContentTypeSelector', () => {
  test('renders the content type label', () => {
    render(<ContentTypeSelector pageTypes={pageTypes} blockTypes={blockTypes} labels={labels} onFilter={() => {}} loading={false} />);
    expect(screen.getByText('Content Type')).toBeInTheDocument();
  });

  test('renders page type options inside the page types optgroup', () => {
    render(<ContentTypeSelector pageTypes={pageTypes} blockTypes={blockTypes} labels={labels} onFilter={() => {}} loading={false} />);
    const group = screen.getByRole('group', { name: 'Page Types' });
    expect(group).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Article Page' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Landing Page' })).toBeInTheDocument();
  });

  test('renders block type options inside the block types optgroup', () => {
    render(<ContentTypeSelector pageTypes={pageTypes} blockTypes={blockTypes} labels={labels} onFilter={() => {}} loading={false} />);
    const group = screen.getByRole('group', { name: 'Block Types' });
    expect(group).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Hero Block' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Teaser Block' })).toBeInTheDocument();
  });

  test('Filter button is disabled when no type is selected', () => {
    render(<ContentTypeSelector pageTypes={pageTypes} blockTypes={blockTypes} labels={labels} onFilter={() => {}} loading={false} />);
    expect(screen.getByRole('button', { name: 'Filter' })).toBeDisabled();
  });

  test('Filter button is disabled while loading', async () => {
    const user = userEvent.setup();
    render(<ContentTypeSelector pageTypes={pageTypes} blockTypes={blockTypes} labels={labels} onFilter={() => {}} loading={true} />);
    await user.selectOptions(screen.getByRole('combobox'), '1');
    expect(screen.getByRole('button', { name: 'Filter' })).toBeDisabled();
  });

  test('Filter button is enabled after a type is selected', async () => {
    const user = userEvent.setup();
    render(<ContentTypeSelector pageTypes={pageTypes} blockTypes={blockTypes} labels={labels} onFilter={() => {}} loading={false} />);
    await user.selectOptions(screen.getByRole('combobox'), '1');
    expect(screen.getByRole('button', { name: 'Filter' })).toBeEnabled();
  });

  test('calls onFilter with the selected id and name when Filter is clicked', async () => {
    const user = userEvent.setup();
    const onFilter = jest.fn();
    render(<ContentTypeSelector pageTypes={pageTypes} blockTypes={blockTypes} labels={labels} onFilter={onFilter} loading={false} />);
    await user.selectOptions(screen.getByRole('combobox'), '2');
    await user.click(screen.getByRole('button', { name: 'Filter' }));
    expect(onFilter).toHaveBeenCalledWith('2', 'Landing Page');
  });

  test('does not call onFilter when no type is selected and Filter is clicked', async () => {
    const user = userEvent.setup();
    const onFilter = jest.fn();
    render(<ContentTypeSelector pageTypes={pageTypes} blockTypes={blockTypes} labels={labels} onFilter={onFilter} loading={false} />);
    await user.click(screen.getByRole('button', { name: 'Filter' }));
    expect(onFilter).not.toHaveBeenCalled();
  });

  test('calls onFilter with a block type id and name', async () => {
    const user = userEvent.setup();
    const onFilter = jest.fn();
    render(<ContentTypeSelector pageTypes={pageTypes} blockTypes={blockTypes} labels={labels} onFilter={onFilter} loading={false} />);
    await user.selectOptions(screen.getByRole('combobox'), '10');
    await user.click(screen.getByRole('button', { name: 'Filter' }));
    expect(onFilter).toHaveBeenCalledWith('10', 'Hero Block');
  });
});
