import { FC } from 'react';
import type { Employee } from '@/types';

interface EmployeeCardProps {
  employee: Employee;
}

export const EmployeeCard: FC<EmployeeCardProps> = ({ employee }) => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0 mr-2">
          <h3 className="text-base font-semibold text-foreground truncate">
            {employee.name || employee.email}
          </h3>
          {employee.name && (
            <p className="text-xs text-foreground-subtle mt-0.5">
              {employee.email}
            </p>
          )}
        </div>
        <span className="badge flex-shrink-0 bg-success/10 text-success border-success/20">
          Activo
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="glass-card p-2">
          <p className="text-xs text-foreground-muted">Rol</p>
          <p className="text-base font-medium text-foreground capitalize">{employee.role}</p>
        </div>
        <div className="glass-card p-2">
          <p className="text-xs text-foreground-muted">Se unió</p>
          <p className="text-base font-medium text-foreground">
            {new Date(employee.joined_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};