'use client';

/**
 * Employees Management Page
 */

import { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { invitationApi } from '@/lib/api';
import { Invitation } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { HelpButton } from '@/components/help/HelpModal';

function EmployeesContent() {
  const { user } = useAuth();
  const { currentStore } = useStore();
  const toast = useToast();

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const loadInvitations = useCallback(async () => {
    if (!currentStore) return;
    
    try {
      setLoading(true);
      const data = await invitationApi.getByStore(currentStore.id);
      setInvitations(data);
    } catch (error) {
      console.error('Failed to load invitations:', error);
    } finally {
      setLoading(false);
    }
  }, [currentStore]);

  useEffect(() => {
    if (currentStore) {
      loadInvitations();
      // Set default store for invitation form
      if (!selectedStoreId) {
        setSelectedStoreId(currentStore.id);
      }
    }
  }, [currentStore, selectedStoreId, loadInvitations]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStoreId) {
      setInviteError('Por favor selecciona una tienda');
      return;
    }

    setInviteError('');
    setInviteSuccess('');
    setInviteLoading(true);

    try {
      const result = await invitationApi.send({
        store_id: selectedStoreId,
        email: inviteEmail,
        role: 'employee',
      });

      setInviteSuccess(`Invitación enviada a ${inviteEmail}. URL: ${result.invitationUrl}`);
      setInviteEmail('');
      setSelectedStoreId(currentStore?.id || '');
      setShowInviteForm(false);
      loadInvitations();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send invitation';
      setInviteError(errorMessage);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCloseInviteForm = () => {
    setShowInviteForm(false);
    setInviteEmail('');
    setSelectedStoreId(currentStore?.id || '');
    setInviteError('');
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('¿Estás seguro de revocar esta invitación?')) return;

    try {
      await invitationApi.revoke(id);
      loadInvitations();
      toast.success('Invitación revocada');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al revocar invitación';
      toast.error(errorMessage);
    }
  };

  const handleResend = async (id: string) => {
    try {
      const result = await invitationApi.resend(id);
      toast.success('Invitación reenviada exitosamente');
      // Copy URL to clipboard
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(result.invitationUrl);
        toast.info('URL copiada al portapapeles');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al reenviar invitación';
      toast.error(errorMessage);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      expired: 'bg-gray-100 text-gray-800',
      revoked: 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  if (!currentStore) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Selecciona una tienda para gestionar empleados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Empleados</h2>
          
          {user?.role === 'owner' && (
            <button
              onClick={() => setShowInviteForm(true)}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm sm:text-base">Invitar Empleado</span>
            </button>
          )}
        </div>

        {/* Success Message */}
        {inviteSuccess && (
          <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg">
            <p className="font-medium text-sm sm:text-base break-words">{inviteSuccess}</p>
          </div>
        )}

        {/* Invite Form Modal */}
        {showInviteForm && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-3 sm:p-4 z-50 overflow-y-auto"
            onClick={(e) => {
              // Close modal when clicking outside the modal content
              if (e.target === e.currentTarget) {
                handleCloseInviteForm();
              }
            }}
          >
            <div 
              className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6 my-4 sm:my-8 max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4 sm:mb-5">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Invitar Empleado</h3>
                <button
                  onClick={handleCloseInviteForm}
                  className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Cerrar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tienda *
                  </label>
                  <select
                    required
                    value={selectedStoreId}
                    onChange={(e) => setSelectedStoreId(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona una tienda</option>
                    {user?.stores?.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                        {store.address && ` - ${store.address}`}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1.5">
                    El empleado será asignado a esta tienda específica
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email del Empleado *
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="empleado@example.com"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    Se enviará una invitación a este email
                  </p>
                </div>

                {inviteError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs sm:text-sm">
                    {inviteError}
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseInviteForm}
                    className="flex-1 px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="flex-1 px-4 py-2.5 sm:py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 active:scale-95"
                  >
                    {inviteLoading ? 'Enviando...' : 'Enviar Invitación'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Invitations List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Invitaciones</h3>
          </div>

          {loading ? (
            <div className="p-6 sm:p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm sm:text-base text-gray-600 mt-4">Cargando...</p>
            </div>
          ) : invitations.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <p className="text-sm sm:text-base text-gray-600">No hay invitaciones aún</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expira
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invitations.map((invitation) => (
                      <tr key={invitation.id}>
                        <td className="px-4 lg:px-6 py-3 sm:py-4 text-sm text-gray-900">
                          <div className="truncate max-w-xs">{invitation.email}</div>
                        </td>
                        <td className="px-4 lg:px-6 py-3 sm:py-4 text-sm text-gray-600 capitalize">
                          {invitation.role}
                        </td>
                        <td className="px-4 lg:px-6 py-3 sm:py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(invitation.status)}`}>
                            {invitation.status}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 sm:py-4 text-sm text-gray-600 whitespace-nowrap">
                          {new Date(invitation.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 lg:px-6 py-3 sm:py-4 text-sm text-gray-600 whitespace-nowrap">
                          {new Date(invitation.expires_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 lg:px-6 py-3 sm:py-4 text-right text-sm font-medium">
                          {invitation.status === 'pending' && user?.role === 'owner' && (
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleResend(invitation.id)}
                                className="text-blue-600 hover:text-blue-700 px-2 py-1 hover:bg-blue-50 rounded transition-colors"
                              >
                                Reenviar
                              </button>
                              <button
                                onClick={() => handleRevoke(invitation.id)}
                                className="text-red-600 hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded transition-colors"
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

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-200">
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="text-sm font-medium text-gray-900 truncate mb-1">
                          {invitation.email}
                        </p>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(invitation.status)}`}>
                          {invitation.status}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                        {invitation.role}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-600 space-y-1 mb-3">
                      <div className="flex justify-between">
                        <span>Creado:</span>
                        <span className="font-medium">
                          {new Date(invitation.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expira:</span>
                        <span className="font-medium">
                          {new Date(invitation.expires_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {invitation.status === 'pending' && user?.role === 'owner' && (
                      <div className="flex gap-2 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => handleResend(invitation.id)}
                          className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors active:scale-95"
                        >
                          Reenviar
                        </button>
                        <button
                          onClick={() => handleRevoke(invitation.id)}
                          className="flex-1 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors active:scale-95"
                        >
                          Revocar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Help Button */}
      <HelpButton />
    </div>
  );
}

export default function EmployeesPage() {
  return (
    <ProtectedRoute allowedRoles={['owner']} redirectTo="/pos">
      <EmployeesContent />
    </ProtectedRoute>
  );
}

