import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export const useWebSocket = ({ topic, onMessage }) => {
  const clientRef = useRef(null);

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");

    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe(`/topic/${topic}`, (msg) => {
          onMessage(msg.body);
        });
      },
    });

    stompClient.activate();
    clientRef.current = stompClient;

    return () => {
      stompClient.deactivate();
    };
  }, [topic, onMessage]);

  return clientRef;
};
