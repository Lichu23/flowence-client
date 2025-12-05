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
    <div className="hidden lg:block overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-card">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase">
              Email
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase">
              Rol
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-foreground-muted uppercase">
              Estado
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase">
              Fecha
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase">
              Expira
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-foreground-muted uppercase">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {invitations.map((invitation) => (
            <tr key={invitation.id}>
              <td className="px-4 py-3">
                <div className="font-medium text-foreground">
                  {invitation.email}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-foreground-muted capitalize">
                {invitation.role}
              </td>
              <td className="px-4 py-3 text-center">
                <InvitationStatusBadge status={invitation.status} />
              </td>
              <td className="px-4 py-3 text-sm text-foreground-muted whitespace-nowrap">
                {new Date(invitation.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-sm text-foreground-muted whitespace-nowrap">
                {new Date(invitation.expires_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                {invitation.status === "pending" && userRole === "owner" && (
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => onResend(invitation.id)}
                      className="text-primary hover:text-primary/80 px-2 py-1 hover:bg-primary/10 rounded text-sm transition-colors"
                    >
                      Reenviar
                    </button>
                    <button
                      onClick={() => onRevoke(invitation.id)}
                      className="text-error hover:text-error/80 px-2 py-1 hover:bg-error/10 rounded text-sm transition-colors"
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