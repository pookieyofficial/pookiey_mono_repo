import { useState, useEffect } from 'react';
import { deepLinkState } from '@/utils/deepLinkState';

export const useDeepLinkProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(deepLinkState.getProcessing());

  useEffect(() => {
    const unsubscribe = deepLinkState.subscribe(setIsProcessing);
    return unsubscribe;
  }, []);

  return isProcessing;
};

