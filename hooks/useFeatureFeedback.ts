import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useFeatureFeedback(featureName: string, interactionThreshold: number = 3) {
  const [showFeedback, setShowFeedback] = useState(false);

  const incrementUsage = useCallback(async () => {
    try {
      const storageKey = `@feedback_count_${featureName}`;
      const currentCountStr = await AsyncStorage.getItem(storageKey);
      let currentCount = currentCountStr ? parseInt(currentCountStr, 10) : 0;
      
      currentCount += 1;
      
      if (currentCount >= interactionThreshold) {
        setShowFeedback(true);
        // Reset the counter so it asks again after the next threshold
        await AsyncStorage.setItem(storageKey, '0');
      } else {
        await AsyncStorage.setItem(storageKey, currentCount.toString());
      }
    } catch (error) {
      console.error('Error managing feedback count:', error);
    }
  }, [featureName, interactionThreshold]);

  const closeFeedback = useCallback(() => {
    setShowFeedback(false);
  }, []);

  return {
    showFeedback,
    incrementUsage,
    closeFeedback,
  };
}
