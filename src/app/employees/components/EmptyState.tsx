import { FC } from 'react';

interface EmptyStateProps {
  message: string;
}

export const EmptyState: FC<EmptyStateProps> = ({ message }) => {
  return (
    <div className="p-6 sm:p-8 text-center">
      <p className="text-sm sm:text-base text-foreground-muted">{message}</p>
    </div>
  );
};
