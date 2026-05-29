'use client';
import Cookies from 'js-cookie'
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { disposeSocket, getSocket, type AppClientSocket } from '@/lib/socket/client';

type SocketContextValue = {
  socket: AppClientSocket;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: PropsWithChildren) {
  const socket = useMemo(() => { const token = Cookies.get('renderLite-access'); return getSocket(token! as string); }, []);
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    if (!socket.connected) socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      // Tear down on full unmount (e.g., logout / leaving dashboard tree).
      disposeSocket();
    };
  }, [socket]);

  const value = useMemo(() => ({ socket, isConnected }), [socket, isConnected]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket(): SocketContextValue {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error('useSocket must be used inside <SocketProvider>');
  }
  return ctx;
}
