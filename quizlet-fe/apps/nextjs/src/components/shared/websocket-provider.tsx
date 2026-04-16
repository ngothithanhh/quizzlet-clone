"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "~/contexts/auth-context";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { toast } from "sonner";
import { env } from "~/env";

export default function WebSocketProvider() {
  const { user } = useAuth();
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    // Chỉ kết nối khi có user
    if (!user?.id) {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      return;
    }

    // Backend URL
    const baseUrl = env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
    const wsUrl = `${baseUrl.replace("http", "ws")}/ws`;
    const sockJsUrl = `${baseUrl}/ws`;

    const client = new Client({
      // We can use native WebSocket or SockJS fallback
      webSocketFactory: () => new SockJS(sockJsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = function () {
      // Đăng ký nhận thông báo từ topic của user
      client.subscribe(`/topic/class-notifications/${user.id}`, (message) => {
        if (message.body) {
          try {
            const data = JSON.parse(message.body);
            if (data.type === "ADDED_TO_CLASS") {
              toast.success(`Thông báo lớp học`, {
                description: data.message,
                duration: 5000,
              });
            }
          } catch (e) {
            console.error("Error parsing websocket message", e);
          }
        }
      });
    };

    client.onStompError = function (frame) {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [user?.id]);

  return null; // Không render UI gì cả
}
