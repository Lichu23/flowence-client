/**
 * EmptyState Component Tests
 */

import { render, screen, fireEvent } from '@/test-utils';
import { EmptyState, EmptyStateIcons } from '../EmptyState';

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No items found" />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(
      <EmptyState 
        title="No items" 
        description="Add your first item to get started" 
      />
    );
    expect(screen.getByText('Add your first item to get started')).toBeInTheDocument();
  });

  it('renders icon', () => {
    render(
      <EmptyState 
        title="No items" 
        icon={<svg data-testid="custom-icon" />} 
      />
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders action button', () => {
    const handleClick = jest.fn();
    render(
      <EmptyState 
        title="No items" 
        action={{
          label: 'Add Item',
          onClick: handleClick
        }}
      />
    );

    const button = screen.getByRole('button', { name: 'Add Item' });
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    const { container } = render(
      <EmptyState title="No items" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders without optional props', () => {
    render(<EmptyState title="No items" />);
    expect(screen.getByText('No items')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('EmptyStateIcons', () => {
  it('provides NoData icon', () => {
    const { container } = render(<div>{EmptyStateIcons.NoData}</div>);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('provides NoProducts icon', () => {
    const { container } = render(<div>{EmptyStateIcons.NoProducts}</div>);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('provides NoSearch icon', () => {
    const { container } = render(<div>{EmptyStateIcons.NoSearch}</div>);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('provides Success icon', () => {
    const { container } = render(<div>{EmptyStateIcons.Success}</div>);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('provides NoStore icon', () => {
    const { container } = render(<div>{EmptyStateIcons.NoStore}</div>);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
