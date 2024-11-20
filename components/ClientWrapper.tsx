// components/ClientWrapper.tsx
"use client";

import React from 'react';
import ErrorBoundary from './ErrorBoundary';

interface ClientWrapperProps {
  children: React.ReactNode;
}

const ClientWrapper: React.FC<ClientWrapperProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};

export default ClientWrapper;