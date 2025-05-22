// src/components/SocketProvider.tsx
import { ReactNode, useEffect } from 'react';
import { useSocketStore } from '../store/useSocketStore';

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const { connect, disconnect } = useSocketStore();
  const authToken = localStorage.getItem('jwt');
  
  useEffect(() => {
    connect(authToken); // Connect when component mounts
    return () => {
      disconnect(); // Disconnect when component unmounts
    };
  }, [connect, disconnect, authToken]);

  return <>{children}</>;
};