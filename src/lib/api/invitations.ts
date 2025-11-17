/**
 * Invitations API
 *
 * This module provides employee invitation API functions including
 * sending, validating, accepting, and managing store invitations.
 */

import { apiRequest } from "./client";
import {
  Invitation,
  SendInvitationData,
  AcceptInvitationData,
  InvitationStats,
  InvitationValidation,
  AuthResponse,
} from "@/types";

export const invitationApi = {
  send: async (
    data: SendInvitationData
  ): Promise<{ invitation: Invitation; invitationUrl: string }> => {
    const response = await apiRequest<{
      invitation: Invitation;
      invitationUrl: string;
    }>("/api/invitations", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data!;
  },

  validate: async (token: string): Promise<InvitationValidation> => {
    const response = await apiRequest<InvitationValidation>(
      `/api/invitations/validate/${token}`
    );
    return response.data!;
  },

  accept: async (data: AcceptInvitationData): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>("/api/invitations/accept", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data!;
  },

  getByStore: async (storeId: string): Promise<Invitation[]> => {
    const response = await apiRequest<Invitation[]>(
      `/api/invitations/store/${storeId}`
    );
    return response.data!;
  },

  getPending: async (storeId: string): Promise<Invitation[]> => {
    const response = await apiRequest<Invitation[]>(
      `/api/invitations/store/${storeId}/pending`
    );
    return response.data!;
  },

  getStats: async (storeId: string): Promise<InvitationStats> => {
    const response = await apiRequest<InvitationStats>(
      `/api/invitations/store/${storeId}/stats`
    );
    return response.data!;
  },

  revoke: async (id: string): Promise<void> => {
    await apiRequest(`/api/invitations/${id}/revoke`, {
      method: "POST",
    });
  },

  resend: async (
    id: string
  ): Promise<{ invitation: Invitation; invitationUrl: string }> => {
    const response = await apiRequest<{
      invitation: Invitation;
      invitationUrl: string;
    }>(`/api/invitations/${id}/resend`, {
      method: "POST",
    });
    return response.data!;
  },
};
