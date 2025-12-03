import { FC } from 'react';
import type { Employee } from '@/types';

interface EmployeesTableProps {
  employees: Employee[];
}

export const EmployeesTable: FC<EmployeesTableProps> = ({ employees }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-foreground-subtle uppercase tracking-wider">
              Nombre
            </th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-foreground-subtle uppercase tracking-wider">
              Email
            </th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-foreground-subtle uppercase tracking-wider">
              Rol
            </th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-foreground-subtle uppercase tracking-wider">
              Se unió
            </th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-foreground-subtle uppercase tracking-wider">
              Estado
            </th>
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-border">
          {employees.map((employee) => (
            <tr key={employee.id} className="hover:bg-card-hover transition-colors">
              <td className="px-4 lg:px-6 py-3 sm:py-4 text-sm text-foreground">
                <div className="truncate max-w-xs">
                  {employee.name || employee.email}
                </div>
              </td>
              <td className="px-4 lg:px-6 py-3 sm:py-4 text-sm text-foreground-muted">
                <div className="truncate max-w-xs">
                  {employee.email}
                </div>
              </td>
              <td className="px-4 lg:px-6 py-3 sm:py-4 text-sm text-foreground-muted capitalize">
                {employee.role}
              </td>
              <td className="px-4 lg:px-6 py-3 sm:py-4 text-sm text-foreground-muted whitespace-nowrap">
                {new Date(employee.joined_at).toLocaleDateString()}
              </td>
              <td className="px-4 lg:px-6 py-3 sm:py-4">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-success/10 text-success border border-success/20">
                  Activo
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
