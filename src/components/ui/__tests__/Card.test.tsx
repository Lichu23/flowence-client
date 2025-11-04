/**
 * Card Component Tests
 */

import { render, screen } from '@/test-utils';
import { Card, CardHeader, CardFooter } from '../Card';

describe('Card', () => {
  it('renders children correctly', () => {
    render(<Card>Test Content</Card>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies different padding sizes', () => {
    const { rerender, container } = render(<Card padding="none">Content</Card>);
    expect(container.firstChild).not.toHaveClass('p-');

    rerender(<Card padding="sm">Content</Card>);
    expect(container.firstChild).toHaveClass('p-3');

    rerender(<Card padding="md">Content</Card>);
    expect(container.firstChild).toHaveClass('p-4');

    rerender(<Card padding="lg">Content</Card>);
    expect(container.firstChild).toHaveClass('p-6');
  });

  it('applies hover effect when enabled', () => {
    const { container } = render(<Card hover>Content</Card>);
    expect(container.firstChild).toHaveClass('hover:shadow-md');
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('CardHeader', () => {
  it('renders title', () => {
    render(<CardHeader title="Card Title" />);
    expect(screen.getByText('Card Title')).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    render(<CardHeader title="Title" subtitle="Subtitle text" />);
    expect(screen.getByText('Subtitle text')).toBeInTheDocument();
  });

  it('renders action element', () => {
    render(
      <CardHeader 
        title="Title" 
        action={<button>Action</button>} 
      />
    );
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<CardHeader title="Title" className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('CardFooter', () => {
  it('renders children correctly', () => {
    render(<CardFooter>Footer Content</CardFooter>);
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<CardFooter className="custom-class">Content</CardFooter>);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('has border-top styling', () => {
    const { container } = render(<CardFooter>Content</CardFooter>);
    expect(container.firstChild).toHaveClass('border-t');
  });
});
