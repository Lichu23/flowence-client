/**
 * ErrorMessage Component Tests
 */

import { render, screen, fireEvent } from '@/test-utils';
import { ErrorMessage } from '../ErrorMessage';

describe('ErrorMessage', () => {
  it('renders error message', () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders custom title', () => {
    render(<ErrorMessage title="Custom Error" message="Error details" />);
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', () => {
    const onRetry = jest.fn();
    render(<ErrorMessage message="Error" onRetry={onRetry} />);
    
    const retryButton = screen.getByRole('button', { name: /reintentar/i });
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorMessage message="Error" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders different variants correctly', () => {
    const { rerender } = render(<ErrorMessage message="Test" variant="error" />);
    expect(screen.getByText('Test').closest('div')).toHaveClass('bg-red-50');

    rerender(<ErrorMessage message="Test" variant="warning" />);
    expect(screen.getByText('Test').closest('div')).toHaveClass('bg-orange-50');

    rerender(<ErrorMessage message="Test" variant="info" />);
    expect(screen.getByText('Test').closest('div')).toHaveClass('bg-blue-50');
  });

  it('applies custom className', () => {
    const { container } = render(<ErrorMessage message="Test" className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders icon', () => {
    const { container } = render(<ErrorMessage message="Test" />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});
