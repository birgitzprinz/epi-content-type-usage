import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pager from '../components/Pager';

const noop = () => {};

describe('Pager', () => {
  test('renders nothing when total is 0', () => {
    const { container } = render(
      <Pager page={1} total={0} pageSize={20} onPageChange={noop} />
    );
    expect(container.querySelector('nav')).toBeNull();
  });

  test('renders nothing when total fits on one page', () => {
    const { container } = render(
      <Pager page={1} total={20} pageSize={20} onPageChange={noop} />
    );
    expect(container.querySelector('nav')).toBeNull();
  });

  test('renders nothing when total equals pageSize exactly', () => {
    const { container } = render(
      <Pager page={1} total={20} pageSize={20} onPageChange={noop} />
    );
    expect(container.querySelector('nav')).toBeNull();
  });

  test('renders page links when total exceeds pageSize', () => {
    render(<Pager page={1} total={50} pageSize={20} onPageChange={noop} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('renders current page as a span inside an active list item', () => {
    render(<Pager page={2} total={60} pageSize={20} onPageChange={noop} />);
    const activeItem = document.querySelector('.page-item.active');
    expect(activeItem).not.toBeNull();
    expect(activeItem.querySelector('.page-link').textContent.trim()).toBe('2');
  });

  test('calls onPageChange with correct page when a page link is clicked', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();
    render(<Pager page={1} total={60} pageSize={20} onPageChange={onPageChange} />);
    await user.click(screen.getByText('3'));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  test('shows next-section "\u2026" when there are more than 10 pages', () => {
    render(<Pager page={1} total={220} pageSize={20} onPageChange={noop} />);
    expect(document.querySelectorAll('.pagination .page-link').length).toBeGreaterThan(1);
  });

  test('calls onPageChange with first page of next section when next "\u2026" is clicked', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();
    render(<Pager page={1} total={220} pageSize={20} onPageChange={onPageChange} />);
    const pageLinks = document.querySelectorAll('.pagination .page-item:last-child .page-link');
    await user.click(pageLinks[0]);
    expect(onPageChange).toHaveBeenCalledWith(11);
  });

  test('shows previous-section link on page 11', () => {
    render(<Pager page={11} total={400} pageSize={20} onPageChange={noop} />);
    const firstLink = document.querySelector('.pagination .page-item:first-child .page-link');
    expect(firstLink).not.toBeNull();
  });

  test('calls onPageChange with last page of previous section when leading link is clicked', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();
    render(<Pager page={11} total={400} pageSize={20} onPageChange={onPageChange} />);
    const firstLink = document.querySelector('.pagination .page-item:first-child .page-link');
    await user.click(firstLink);
    expect(onPageChange).toHaveBeenCalledWith(10);
  });
});
