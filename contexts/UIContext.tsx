import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { CustomModal } from '@/components/ui/CustomModal';
import { CustomToast } from '@/components/ui/CustomToast';

export interface UIContextType {
  showModal: (title: string, message: string, buttons?: { text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }[]) => void;
  hideModal: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [modalState, setModalState] = useState<{ visible: boolean; props?: any }>({ visible: false });
  const [toastState, setToastState] = useState<{ visible: boolean; props?: any }>({ visible: false });

  const showModal = useCallback((title: string, message: string, buttons?: any[]) => {
    setModalState({
      visible: true,
      props: { title, message, buttons },
    });
  }, []);

  const hideModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, visible: false }));
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastState({
      visible: true,
      props: { message, type },
    });
  }, []);

  const hideToast = useCallback(() => {
    setToastState((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <UIContext.Provider value={{ showModal, hideModal, showToast, hideToast }}>
      {children}
      <CustomModal 
        visible={modalState.visible} 
        onClose={hideModal}
        {...modalState.props} 
      />
      <CustomToast
        visible={toastState.visible}
        onClose={hideToast}
        {...toastState.props}
      />
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
