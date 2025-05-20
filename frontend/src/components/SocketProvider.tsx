// src/components/SocketProvider.tsx
import { ReactNode, useEffect } from 'react';
import { useSocketStore } from '../store/useSocketStore';

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const { connect, disconnect } = useSocketStore();

  useEffect(() => {
    connect(); // Connect when component mounts
    return () => {
      disconnect(); // Disconnect when component unmounts
    };
  }, [connect, disconnect]);

  return <>{children}</>;
};