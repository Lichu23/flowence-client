import { FC } from 'react';
import type { Invitation } from '@/types';
import { InvitationStatusBadge } from './InvitationStatusBadge';

interface InvitationCardProps {
  invitation: Invitation;
  onResend: (id: string) => void;
  onRevoke: (id: string) => void;
  userRole?: string;
}

export const InvitationCard: FC<InvitationCardProps> = ({
  invitation,
  onResend,
  onRevoke,
  userRole,
}) => {
  return (
    <div className="p-4 hover:bg-card-hover transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0 mr-2">
          <p className="text-sm font-medium text-foreground truncate mb-1">
            {invitation.email}
          </p>
          <InvitationStatusBadge status={invitation.status} />
        </div>
        <span className="text-xs text-foreground-muted capitalize bg-card px-2 py-1 rounded flex-shrink-0">
          {invitation.role}
        </span>
      </div>

      <div className="text-xs text-foreground-subtle space-y-1 mb-3">
        <div className="flex justify-between">
          <span>Creado:</span>
          <span className="font-medium text-foreground-muted">
            {new Date(invitation.created_at).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Expira:</span>
          <span className="font-medium text-foreground-muted">
            {new Date(invitation.expires_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {invitation.status === "pending" && userRole === "owner" && (
        <div className="flex gap-2 pt-2 border-t border-border">
          <button
            onClick={() => onResend(invitation.id)}
            className="flex-1 px-3 py-2 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors active:scale-95"
          >
            Reenviar
          </button>
          <button
            onClick={() => onRevoke(invitation.id)}
            className="flex-1 px-3 py-2 text-xs font-medium text-error bg-error/10 hover:bg-error/20 rounded-lg transition-colors active:scale-95"
          >
            Revocar
          </button>
        </div>
      )}
    </div>
  );
};
