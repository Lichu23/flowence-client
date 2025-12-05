import { FC } from 'react';
import type { Employee } from '@/types';
import { EmployeesTable } from './EmployeesTable';
import { EmployeeCard } from './EmployeeCard';
import { EmptyState } from './EmptyState';

interface EmployeesListProps {
  employees: Employee[];
  loading: boolean;
}

export const EmployeesList: FC<EmployeesListProps> = ({ employees, loading }) => {
  if (loading) {
    return (
      <div className="p-6 sm:p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm sm:text-base text-foreground-muted mt-4">
          Cargando empleados...
        </p>
      </div>
    );
  }

  if (employees.length === 0) {
    return <EmptyState message="No hay empleados activos en esta tienda" />;
  }

  return (
    <>
      {/* Desktop Table View */}
      <EmployeesTable employees={employees} />

      {/* Mobile Card View */}
      <div className="lg:hidden divide-y divide-border">
        {employees.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </div>
    </>
  );
};