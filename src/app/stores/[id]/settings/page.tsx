"use client";

/**
 * Store Settings Page
 * Allows store owners to configure store settings
 */

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { storeApi } from "@/lib/api";
import { Store, UpdateStoreData } from "@/types";
import { CurrencyConversionPreview } from "@/components/common/CurrencyConversionPreview";
import Image from "next/image";

type TabType = "general" | "appearance";

export default function StoreSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const storeId = params.id as string;

  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [showCurrencyConfirm, setShowCurrencyConfirm] = useState(false);
  const [pendingCurrency, setPendingCurrency] = useState<string>("");

  const [formData, setFormData] = useState<UpdateStoreData>({
    name: "",
    address: "",
    phone: "",
    currency: "USD",
    tax_rate: 0,
    timezone: "UTC",
    date_format: "MM/DD/YYYY",
    time_format: "12h",
    logo_url: "",
  });
  const loadStore = useCallback(async () => {
    try {
      setLoading(true);
      const response = await storeApi.getById(storeId);
      setStore(response.store);

      // Populate form with existing data
      setFormData({
        name: response.store.name,
        address: response.store.address || "",
        phone: response.store.phone || "",
        currency: response.store.currency,
        tax_rate: response.store.tax_rate,
        timezone: response.store.timezone || "UTC",
        date_format: response.store.date_format || "MM/DD/YYYY",
        time_format: response.store.time_format || "12h",
        logo_url: response.store.logo_url || "",
      });
    } catch {
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    loadStore();
  }, [loadStore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setSaving(true);

    try {
      const response = await storeApi.update(storeId, formData);
      
      // Check if currency conversion happened (use typed narrow)
      type CurrencyConversion = {
        converted_products: number;
        from: string;
        to: string;
        warning?: string;
      };
      type UpdateResponse = { currency_conversion?: CurrencyConversion };
      const { currency_conversion } = response as UpdateResponse;
      if (currency_conversion) {
        let message = "Settings saved successfully!";
        
        if (currency_conversion.converted_products > 0) {
          message += ` Converted ${currency_conversion.converted_products} products from ${currency_conversion.from} to ${currency_conversion.to}.`;
        }
        
        if (currency_conversion.warning) {
          message += ` Warning: ${currency_conversion.warning}`;
        }
        
        setSuccess(message);
      } else {
        setSuccess("Settings saved successfully!");
      }
      
      await loadStore(); // Reload to get updated data

      // Clear success message after 5 seconds (longer for conversion messages)
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save settings";
      console.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof UpdateStoreData, value: string | number) => {
    // If changing currency, show confirmation dialog
    if (field === 'currency' && store && value !== store.currency) {
      setPendingCurrency(value as string);
      setShowCurrencyConfirm(true);
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const confirmCurrencyChange = () => {
    setFormData((prev) => ({ ...prev, currency: pendingCurrency }));
    setShowCurrencyConfirm(false);
    setPendingCurrency("");
  };

  const cancelCurrencyChange = () => {
    setShowCurrencyConfirm(false);
    setPendingCurrency("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading store settings...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Store not found</p>
          <button
            onClick={() => router.push("/stores")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Stores
          </button>
        </div>
      </div>
    );
  }

  // Check if user is owner
  const isOwner = user?.stores.find((s) => s.id === storeId)?.role === "owner";
  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Only store owners can access settings</p>
          <button
            onClick={() => router.push("/stores")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Stores
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/stores")}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
          >
            ← Back to Stores
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Store Settings</h1>
          <p className="text-gray-600 mt-2">{store.name}</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("general")}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "general"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                General
              </button>
              <button
                onClick={() => setActiveTab("appearance")}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === "appearance"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Appearance
              </button>
              
            </nav>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* General Tab */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency *
                    </label>
                    <select
                      required
                      value={formData.currency}
                      onChange={(e) => handleChange("currency", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="CAD">CAD ($)</option>
                      <option value="AUD">AUD ($)</option>
                      <option value="MXN">MXN ($)</option>
                      <option value="ARS">ARS ($)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Rate (%) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.tax_rate}
                      onChange={(e) =>
                        handleChange("tax_rate", parseFloat(e.target.value))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Currency Conversion Preview */}
                {store && formData.currency !== store.currency && (
                  <div className="mt-4">
                    <CurrencyConversionPreview
                      amount={100}
                      fromCurrency={store.currency ?? 'USD'}
                      toCurrency={formData.currency ?? 'USD'}
                    />
                  </div>
                )}

                {/* Low stock threshold removed: each product has its own min stock */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => handleChange("timezone", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="America/Mexico_City">Mexico City</option>
                      <option value="America/Argentina/Buenos_Aires">Buenos Aires (ART)</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Format
                    </label>
                    <select
                      value={formData.date_format}
                      onChange={(e) =>
                        handleChange("date_format", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Format
                    </label>
                    <select
                      value={formData.time_format}
                      onChange={(e) =>
                        handleChange("time_format", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="12h">12-hour (AM/PM)</option>
                      <option value="24h">24-hour</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Logo URL
                  </label>
                  <input
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => handleChange("logo_url", e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter the URL of your store logo image
                  </p>
                  {formData.logo_url && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Preview:
                      </p>
                      <div className="h-24 w-full flex items-center justify-center border border-gray-200 rounded-lg p-2 bg-white">
                        <Image
                          src={formData.logo_url}
                          alt="Store logo preview"
                          width={160}
                          height={80}
                          className="max-h-20 object-contain w-auto h-auto"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push("/stores")}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Currency Change Confirmation Modal */}
      {showCurrencyConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Currency Change Confirmation</h3>
                <p className="text-sm text-gray-600">This action will convert all product prices</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Changing your store&apos;s currency from <span className="font-mono">{store?.currency}</span> to <span className="font-mono">{pendingCurrency}</span> will automatically convert all product prices using current exchange rates.
                </p>
                <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                  <li>All product prices will be updated</li>
                  <li>Product costs will be converted</li>
                  <li>Historical sales data will remain in original currency</li>
                  <li>This action cannot be undone automatically</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelCurrencyChange}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmCurrencyChange}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Confirm Currency Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
