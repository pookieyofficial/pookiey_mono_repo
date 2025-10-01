// Simple state manager for deep link processing without hooks
let isProcessing = false;
let listeners: Array<(value: boolean) => void> = [];

export const deepLinkState = {
  setProcessing: (value: boolean) => {
    isProcessing = value;
    listeners.forEach(listener => listener(value));
  },

  getProcessing: () => isProcessing,

  subscribe: (listener: (value: boolean) => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },
};

