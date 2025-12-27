// frontend/src/hooks/useClientDetail.js

import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export function useClientDetail(clientId) {
  const [client, setClient] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [loading, setLoading] = useState(true);
  const [webhookForm, setWebhookForm] = useState({ webhookUrl: "" });
  const [showWebhookForm, setShowWebhookForm] = useState(false);

  // Reference for the status check interval
  const statusCheckIntervalRef = useRef(null);

  // Clear interval function wrapped in useCallback
  const clearCheckInterval = useCallback(() => {
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current);
      statusCheckIntervalRef.current = null;
    }
  }, []);

  // Function to load client data
  const fetchClientData = useCallback(async () => {
    if (!clientId) return null;

    try {
      setLoading(true);
      const response = await axios.get(`/api/clients/${clientId}`);
      const clientData = response.data.client;
      setClient(clientData);

      // Initialize webhook form with current value
      setWebhookForm({
        webhookUrl: clientData.webhookUrl || "",
      });

      // Hide QR if client is connected
      if (clientData.isConnected) {
        setShowQR(false);
      }

      return clientData;
    } catch (error) {
      console.error("Error loading client data:", error);
      toast.error("Error loading client information");
      return null;
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  // Function to check connection status periodically
  const startCheckingConnectionStatus = useCallback(() => {
    clearCheckInterval();

    statusCheckIntervalRef.current = setInterval(async () => {
      try {
        const statusResponse = await axios.get(
          `/api/whatsapp/client/${clientId}/status`
        );

        if (statusResponse.data.isConnected) {
          setShowQR(false);
          fetchClientData();
          toast.success("Client connected successfully");
          clearCheckInterval();
        }
      } catch (error) {
        console.error("Error checking connection status:", error);
      }
    }, 5000);
  }, [clientId, fetchClientData, clearCheckInterval]);

  // Other methods as needed...

  // Load data when the component mounts
  useEffect(() => {
    const loadData = async () => {
      await fetchClientData();
    };

    loadData();

    // Cleanup on unmount
    return () => {
      clearCheckInterval();
      if (qrCode) {
        URL.revokeObjectURL(qrCode);
      }
    };
  }, [clientId, fetchClientData, clearCheckInterval, qrCode]);

  // Return everything needed by the component
  return {
    client,
    loading,
    qrCode,
    showQR,
    actionLoading,
    webhookForm,
    showWebhookForm,
    setShowWebhookForm,
    fetchClientData,
    clearCheckInterval,
    startCheckingConnectionStatus,
    // Include other methods and state as needed...
  };
}