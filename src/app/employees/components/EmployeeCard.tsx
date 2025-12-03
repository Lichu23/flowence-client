import { FC } from 'react';
import type { Employee } from '@/types';

interface EmployeeCardProps {
  employee: Employee;
}

export const EmployeeCard: FC<EmployeeCardProps> = ({ employee }) => {
  return (
    <div className="p-4 hover:bg-card-hover transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0 mr-2">
          <p className="text-sm font-medium text-foreground truncate mb-1">
            {employee.name || employee.email}
          </p>
          {employee.name && (
            <p className="text-xs text-foreground-muted truncate">
              {employee.email}
            </p>
          )}
          <span className="inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full bg-success/10 text-success border border-success/20">
            Activo
          </span>
        </div>
        <span className="text-xs text-foreground-muted capitalize bg-card px-2 py-1 rounded flex-shrink-0">
          {employee.role}
        </span>
      </div>

      <div className="text-xs text-foreground-subtle space-y-1">
        <div className="flex justify-between">
          <span>Se unió:</span>
          <span className="font-medium text-foreground-muted">
            {new Date(employee.joined_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};
