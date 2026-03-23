import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useFeatureFeedback(featureName: string, triggerCount: number = 3) {
  const [usageCount, setUsageCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  const storageKey = `@feedback_count_${featureName}`;

  useEffect(() => {
    loadCount();
  }, []);

  const loadCount = async () => {
    try {
      const storedCount = await AsyncStorage.getItem(storageKey);
      if (storedCount !== null) {
        setUsageCount(parseInt(storedCount, 10));
      }
    } catch (e) {
      console.error('Failed to load usage count from AsyncStorage', e);
    }
  };

  const incrementUsage = async () => {
    try {
      const newCount = usageCount + 1;
      setUsageCount(newCount);
      await AsyncStorage.setItem(storageKey, newCount.toString());

      // If we hit the trigger count, show the feedback popup
      if (newCount > 0 && newCount % triggerCount === 0) {
        setShowFeedback(true);
      }
    } catch (e) {
      console.error('Failed to save usage count to AsyncStorage', e);
    }
  };

  const closeFeedback = () => {
    setShowFeedback(false);
  };

  return {
    usageCount,
    showFeedback,
    incrementUsage,
    closeFeedback
  };
}
