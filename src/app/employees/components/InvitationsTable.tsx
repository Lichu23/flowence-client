import { FC } from 'react';
import type { Invitation } from '@/types';
import { InvitationStatusBadge } from './InvitationStatusBadge';

interface InvitationsTableProps {
  invitations: Invitation[];
  onResend: (id: string) => void;
  onRevoke: (id: string) => void;
  userRole?: string;
}

export const InvitationsTable: FC<InvitationsTableProps> = ({
  invitations,
  onResend,
  onRevoke,
  userRole,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-foreground-subtle uppercase tracking-wider">
              Email
            </th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-foreground-subtle uppercase tracking-wider">
              Rol
            </th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-foreground-subtle uppercase tracking-wider">
              Estado
            </th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-foreground-subtle uppercase tracking-wider">
              Fecha
            </th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-foreground-subtle uppercase tracking-wider">
              Expira
            </th>
            <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-foreground-subtle uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-border">
          {invitations.map((invitation) => (
            <tr key={invitation.id} className="hover:bg-card-hover transition-colors">
              <td className="px-4 lg:px-6 py-3 sm:py-4 text-sm text-foreground">
                <div className="truncate max-w-xs">
                  {invitation.email}
                </div>
              </td>
              <td className="px-4 lg:px-6 py-3 sm:py-4 text-sm text-foreground-muted capitalize">
                {invitation.role}
              </td>
              <td className="px-4 lg:px-6 py-3 sm:py-4">
                <InvitationStatusBadge status={invitation.status} />
              </td>
              <td className="px-4 lg:px-6 py-3 sm:py-4 text-sm text-foreground-muted whitespace-nowrap">
                {new Date(invitation.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 lg:px-6 py-3 sm:py-4 text-sm text-foreground-muted whitespace-nowrap">
                {new Date(invitation.expires_at).toLocaleDateString()}
              </td>
              <td className="px-4 lg:px-6 py-3 sm:py-4 text-right text-sm font-medium">
                {invitation.status === "pending" && userRole === "owner" && (
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => onResend(invitation.id)}
                      className="text-primary hover:text-primary/80 px-2 py-1 hover:bg-primary/10 rounded transition-colors"
                    >
                      Reenviar
                    </button>
                    <button
                      onClick={() => onRevoke(invitation.id)}
                      className="text-error hover:text-error/80 px-2 py-1 hover:bg-error/10 rounded transition-colors"
                    >
                      Revocar
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
