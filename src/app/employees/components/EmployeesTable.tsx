import { FC } from 'react';
import type { Employee } from '@/types';

interface EmployeesTableProps {
  employees: Employee[];
}

export const EmployeesTable: FC<EmployeesTableProps> = ({ employees }) => {
  return (
    <div className="hidden lg:block overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-card">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase">
              Nombre
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase">
              Email
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase">
              Rol
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase">
              Se unió
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-foreground-muted uppercase">
              Estado
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td className="px-4 py-3">
                <div className="font-medium text-foreground">
                  {employee.name || employee.email}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm text-foreground-muted">
                  {employee.email}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-foreground-muted capitalize">
                {employee.role}
              </td>
              <td className="px-4 py-3 text-sm text-foreground-muted whitespace-nowrap">
                {new Date(employee.joined_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-center">
                <span className="badge bg-success/10 text-success border-success/20">
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