import { FC } from 'react';

interface InvitationStatusBadgeProps {
  status: string;
}

export const InvitationStatusBadge: FC<InvitationStatusBadgeProps> = ({ status }) => {
  const getStatusClasses = (status: string) => {
    const badges = {
      pending: "bg-warning/10 text-warning border-warning/20",
      accepted: "bg-success/10 text-success border-success/20",
      expired: "bg-gray-800 text-foreground-muted border-border",
      revoked: "bg-error/10 text-error border-error/20",
    };
    return badges[status as keyof typeof badges] || "bg-gray-800 text-foreground-muted border-border";
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusClasses(status)}`}
    >
      {status}
    </span>
  );
};
