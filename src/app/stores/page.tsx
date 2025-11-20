'use client';

/**
 * Stores Management Page
 */

import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { StoreListItem } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/components/ui/Toast';
import { HelpButton } from '@/components/help/HelpModal';

function StoresContent() {
  const { user } = useAuth();
  const { stores, createStore, updateStore, deleteStore, refreshStores } = useStore();
  const toast = useToast();

  // Hooks must be called unconditionally
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreListItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    address: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editError, setEditError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createStore(formData);
      setFormData({ name: '', address: '', phone: '' });
      setShowCreateForm(false);
      await refreshStores();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create store';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteStore(id);
      await refreshStores();
      toast.success('Tienda eliminada exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar tienda';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (store: StoreListItem) => {
    setEditingStore(store);
    setEditFormData({
      name: store.name,
      address: store.address || '',
      phone: store.phone || '',
    });
    setEditError('');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) return;
    
    setEditError('');
    setLoading(true);

    try {
      await updateStore(editingStore.id, editFormData);
      setEditingStore(null);
      setEditFormData({ name: '', address: '', phone: '' });
      await refreshStores();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update store';
      setEditError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Mis Tiendas</h2>
          
          {user?.role === 'owner' && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg md:rounded-xl shadow-purple hover:from-purple-700 hover:to-fuchsia-700 hover:shadow-purple-lg hover:scale-105 active:scale-95 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Agregar Tienda</span>
            </button>
          )}
        </div>

        {/* Create Store Form */}
        {showCreateForm && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center p-3 sm:p-4 z-50 overflow-y-auto"
            onClick={(e) => {
              // Close modal when clicking outside the modal content
              if (e.target === e.currentTarget) {
                setShowCreateForm(false);
                setError('');
              }
            }}
          >
            <div 
              className="glass-card max-w-md w-full p-4 sm:p-6 my-4 sm:my-8 max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4 sm:mb-5">
                <h3 className="text-lg sm:text-xl font-bold text-foreground">Crear Nueva Tienda</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-foreground-subtle hover:text-foreground p-1 hover:bg-card rounded-lg transition-colors"
                  aria-label="Cerrar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Nombre de la Tienda *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field w-full text-sm sm:text-base"
                    placeholder="Mi Tienda Principal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="input-field w-full text-sm sm:text-base"
                    placeholder="Calle 123, Ciudad"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field w-full text-sm sm:text-base"
                    placeholder="+1234567890"
                  />
                </div>

                {error && (
                  <div className="glass-card bg-error/10 border-error/30 text-error px-3 py-2 rounded-lg text-xs sm:text-sm">
                    {error}
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="btn-secondary flex-1 px-3 py-2 md:px-4 md:py-2 text-sm md:text-base active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg md:rounded-xl shadow-purple hover:from-purple-700 hover:to-fuchsia-700 hover:shadow-purple-lg hover:scale-105 active:scale-95 transition-all flex-1 disabled:opacity-50"
                  >
                    {loading ? 'Creando...' : 'Crear Tienda'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Store Form */}
        {editingStore && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center p-3 sm:p-4 z-50 overflow-y-auto"
            onClick={(e) => {
              // Close modal when clicking outside the modal content
              if (e.target === e.currentTarget) {
                setEditingStore(null);
                setEditError('');
              }
            }}
          >
            <div 
              className="glass-card max-w-md w-full p-4 sm:p-6 my-4 sm:my-8 max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4 sm:mb-5">
                <h3 className="text-lg sm:text-xl font-bold text-foreground">Editar Tienda</h3>
                <button
                  onClick={() => setEditingStore(null)}
                  className="text-foreground-subtle hover:text-foreground p-1 hover:bg-card rounded-lg transition-colors"
                  aria-label="Cerrar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Nombre de la Tienda *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="input-field w-full text-sm sm:text-base"
                    placeholder="Mi Tienda"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="input-field w-full text-sm sm:text-base"
                    placeholder="Calle 123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="input-field w-full text-sm sm:text-base"
                    placeholder="+1234567890"
                  />
                </div>

                {editError && (
                  <div className="glass-card bg-error/10 border-error/30 text-error px-3 py-2 rounded-lg text-xs sm:text-sm">
                    {editError}
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingStore(null)}
                    className="btn-secondary flex-1 px-3 py-2 md:px-4 md:py-2 text-sm md:text-base active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg md:rounded-xl shadow-purple hover:from-purple-700 hover:to-fuchsia-700 hover:shadow-purple-lg hover:scale-105 active:scale-95 transition-all flex-1 disabled:opacity-50"
                  >
                    {loading ? 'Actualizando...' : 'Actualizar Tienda'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stores Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {stores.map((store) => (
            <div
              key={store.id}
              className="glass-card p-4 sm:p-6 hover:shadow-xl-ambient hover:shadow-xl-direct transition-shadow"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex-1 min-w-0 mr-2">
                  <div className="flex items-center gap-2 mb-1.5">
                    {store.logo_url && (
                      <Image
                        src={store.logo_url}
                        alt="Store logo"
                        width={24}
                        height={24}
                        className="h-6 w-6 object-contain rounded"
                      />
                    )}
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground truncate">{store.name}</h3>
                  </div>
                  <span className="badge bg-info/10 text-info border-info/20 capitalize">
                    {store.role}
                  </span>
                </div>
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>

              {store.address && (
                <p className="text-xs sm:text-sm text-foreground-muted mb-2 truncate">
                  📍 {store.address}
                </p>
              )}

              {store.phone && (
                <p className="text-xs sm:text-sm text-foreground-muted mb-3 sm:mb-4">
                  📞 {store.phone}
                </p>
              )}

              <div className="flex flex-col gap-2 mt-3 sm:mt-4">
                <Link
                  href="/dashboard"
                  className="px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg md:rounded-xl shadow-purple hover:from-purple-700 hover:to-fuchsia-700 hover:shadow-purple-lg hover:scale-105 active:scale-95 transition-all w-full text-center"
                >
                  Ver Dashboard
                </Link>
                
                {user?.role === 'owner' && (
                  <>
                    <Link
                      href={`/stores/${store.id}/settings`}
                      className="btn-secondary w-full px-3 py-2 md:px-4 md:py-2 text-center text-sm md:text-base active:scale-95 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Configuración
                    </Link>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(store)}
                        className="btn-secondary flex-1 px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm text-primary hover:text-primary/80 transition-colors active:scale-95"
                      >
                        Editar
                      </button>
                      
                      {stores.length > 1 && (
                        <button
                          onClick={() => handleDelete(store.id, store.name)}
                          className="btn-secondary flex-1 px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm text-error hover:text-error/80 transition-colors active:scale-95"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {stores.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-foreground-subtle mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-medium text-foreground mb-2">No stores yet</h3>
            <p className="text-foreground-muted">Create your first store to get started</p>
          </div>
        )}
      </main>

      {/* Help Button */}
      <HelpButton />
    </div>
  );
}

export default function StoresPage() {
  return (
    <ProtectedRoute>
      <StoresContent />
    </ProtectedRoute>
  );
}

