"use client";

/**
 * Employees Management Page
 */

import { useState, useEffect, useCallback } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";
import { invitationApi, storeApi } from "@/lib/api";
import { Invitation, Employee } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { HelpButton } from "@/components/help/HelpModal";
import {
  EmptyState,
  InviteEmployeeModal,
  InvitationsTable,
  InvitationCard,
  EmployeesList,
  EmployeesPagination,
} from "./components";

const EMPLOYEES_PER_PAGE = 10;

function EmployeesContent() {
  const { user } = useAuth();
  const { currentStore, stores } = useStore();
  const toast = useToast();

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [invitationsLoading, setInvitationsLoading] = useState(true);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);

  // Pagination state for employees
  const [employeesPage, setEmployeesPage] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);

  // Pagination state for invitations
  const [invitationsPage, setInvitationsPage] = useState(1);
  const [totalInvitations, setTotalInvitations] = useState(0);

  const loadInvitations = useCallback(async () => {
    if (!currentStore) return;

    try {
      setInvitationsLoading(true);
      const data = await invitationApi.getByStore(currentStore.id);
      setInvitations(data);
      setTotalInvitations(data.length);
    } catch (error) {
      console.error("Failed to load invitations:", error);
    } finally {
      setInvitationsLoading(false);
    }
  }, [currentStore]);

  const loadEmployees = useCallback(async () => {
    if (!currentStore) return;

    try {
      setEmployeesLoading(true);
      const data = await storeApi.getEmployees(currentStore.id);
      setEmployees(data);
      setTotalEmployees(data.length);
    } catch (error) {
      console.error("Failed to load employees:", error);
    } finally {
      setEmployeesLoading(false);
    }
  }, [currentStore]);

  useEffect(() => {
    if (currentStore) {
      loadInvitations();
      loadEmployees();
    }
  }, [currentStore, loadInvitations, loadEmployees]);

  // Reset pagination when store changes
  useEffect(() => {
    setEmployeesPage(1);
    setInvitationsPage(1);
  }, [currentStore?.id]);

  const handleSendInvite = async (email: string, storeId: string) => {
    await invitationApi.send({
      store_id: storeId,
      email,
      role: "employee",
    });

    loadInvitations();
    loadEmployees();
    toast.success(`Invitación enviada a ${email}`);
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("¿Estás seguro de revocar esta invitación?")) return;

    try {
      await invitationApi.revoke(id);
      loadInvitations();
      toast.success("Invitación revocada");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al revocar invitación";
      toast.error(errorMessage);
    }
  };

  const handleResend = async (id: string) => {
    try {
      const result = await invitationApi.resend(id);
      toast.success("Invitación reenviada exitosamente");
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(result.invitationUrl);
        toast.info("URL copiada al portapapeles");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al reenviar invitación";
      toast.error(errorMessage);
    }
  };

  // Paginated data
  const paginatedEmployees = employees.slice(
    (employeesPage - 1) * EMPLOYEES_PER_PAGE,
    employeesPage * EMPLOYEES_PER_PAGE
  );
  const totalEmployeesPages = Math.ceil(totalEmployees / EMPLOYEES_PER_PAGE) || 1;

  const paginatedInvitations = invitations.slice(
    (invitationsPage - 1) * EMPLOYEES_PER_PAGE,
    invitationsPage * EMPLOYEES_PER_PAGE
  );
  const totalInvitationsPages = Math.ceil(totalInvitations / EMPLOYEES_PER_PAGE) || 1;

  if (!currentStore) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background bg-grid flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground-muted">
            Selecciona una tienda para gestionar empleados
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background bg-grid">
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Gestión de Empleados
          </h2>

          {user?.role === "owner" && (
            <button
              onClick={() => setShowInviteForm(true)}
              className="px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg md:rounded-xl shadow-purple hover:from-purple-700 hover:to-fuchsia-700 hover:shadow-purple-lg hover:scale-105 active:scale-95 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span className="text-sm sm:text-base">Invitar Empleado</span>
            </button>
          )}
        </div>

        {/* Invite Form Modal */}
        <InviteEmployeeModal
          isOpen={showInviteForm}
          onClose={() => setShowInviteForm(false)}
          onSuccess={handleSendInvite}
          stores={stores.filter(s => s.role === 'owner')}
          currentStoreId={currentStore.id}
        />

        {/* Active Employees Section */}
        <div className="glass-card mb-6">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              Empleados Activos
            </h3>
          </div>
          <EmployeesList employees={paginatedEmployees} loading={employeesLoading} />
          <EmployeesPagination
            currentPage={employeesPage}
            totalPages={totalEmployeesPages}
            totalEmployees={totalEmployees}
            onPageChange={setEmployeesPage}
          />
        </div>

        {/* Invitations List */}
        <div className="glass-card">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              Invitaciones
            </h3>
          </div>

          {invitationsLoading ? (
            <div className="p-6 sm:p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm sm:text-base text-foreground-muted mt-4">
                Cargando...
              </p>
            </div>
          ) : invitations.length === 0 ? (
            <EmptyState message="No hay invitaciones aún" />
          ) : (
            <>
              {/* Desktop Table View */}
              <InvitationsTable
                invitations={paginatedInvitations}
                onResend={handleResend}
                onRevoke={handleRevoke}
                userRole={user?.role}
              />

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-border">
                {paginatedInvitations.map((invitation) => (
                  <InvitationCard
                    key={invitation.id}
                    invitation={invitation}
                    onResend={handleResend}
                    onRevoke={handleRevoke}
                    userRole={user?.role}
                  />
                ))}
              </div>

              {/* Invitations Pagination */}
              <EmployeesPagination
                currentPage={invitationsPage}
                totalPages={totalInvitationsPages}
                totalEmployees={totalInvitations}
                onPageChange={setInvitationsPage}
              />
            </>
          )}
        </div>
      </main>

      <HelpButton />
    </div>
  );
}

export default function EmployeesPage() {
  return (
    <ProtectedRoute allowedRoles={["owner"]} redirectTo="/pos">
      <EmployeesContent />
    </ProtectedRoute>
  );
}