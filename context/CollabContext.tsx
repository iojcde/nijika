"use client";

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import yPartykitProvider from "y-partykit/provider";
import { Doc } from "yjs";
import type { Awareness } from "y-protocols/awareness";
import { useSession } from "next-auth/react";
import { getRandomColor } from "@/lib/randomColor";

export interface collabContext {
  provider: yPartykitProvider;
  doc: Doc;
  initProvider: (room: string, token: string) => void;
  connectionStatus: "disconnected" | "connecting" | "connected";
}

const yDoc = new Doc();

const offlineProvider = new yPartykitProvider(
  `nijika.iojcde.partykit.dev`,
  "offline-room",
  yDoc,
  {
    connect: false,
  }
);

const Context = createContext<collabContext>({
  provider: offlineProvider,
  initProvider: () => {},
  connectionStatus: "disconnected",
  doc: yDoc,
});

type ConnectionStatus = "disconnected" | "connecting" | "connected";

export const CollabProvider = ({
  children,
  room,
}: {
  children: ReactNode;
  room: string;
}) => {
  const { data: session, status } = useSession();
  const [doc, setDoc] = useState(yDoc);
  const [provider, setProvider] = useState(offlineProvider);

  const computedConnectionStatus = provider.wsconnected
    ? "connected"
    : provider.wsconnecting
    ? "connecting"
    : "disconnected";

  const [connectionState, setConnectionState] = useState<ConnectionStatus>(
    computedConnectionStatus
  );

  useEffect(() => {
    provider.on("status", (event: { status: ConnectionStatus }) => {
      setConnectionState(event.status);
    });
  }, [provider]);

  if (connectionState !== computedConnectionStatus) {
    setConnectionState(computedConnectionStatus);
  }

  const initProvider = (room: string, token: string) => {
    console.log("initprovider", { room, token });
    const newdoc = new Doc();
    setDoc(newdoc);

    provider.destroy();
    const p = new yPartykitProvider(
      process.env.NODE_ENV == "development"
        ? "localhost:1999"
        : `nijika.iojcde.partykit.dev`,
      room,
      newdoc,
      {
        connect: false,
      }
    );
    setProvider(p);

    const url = new URL(p.url);
    url.searchParams.set("token", token);
    p.url = url.toString();

    p.connect();

    p.awareness.setLocalStateField("user", {
      color: getRandomColor(),
      name: session?.user.name,
      photo: session?.user.image,
    });
  };

  const value = {
    provider,
    initProvider,
    doc,
    connectionStatus: connectionState,
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useCollabContext = () => {
  return useContext(Context);
};
