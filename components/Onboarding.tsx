import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {router, useNavigation, usePathname} from 'expo-router';

const ONBOARDING_COMPLETED_KEY = 'ONBOARDING_COMPLETED';

interface OnboardingStep {
  id: string;
  title: string;
  text: string;
  position: {
    top?: number | string;
    bottom?: number | string;
    left?: number | string;
    right?: number | string;
    width?: number | string;
    height?: number | string;
  };
  screen: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'home-intro',
    title: 'Welcome to DayPilot!',
    text: 'This is your home screen where you can see today\'s tasks. You don\'t have any tasks yet. Let\s see how we can add them.',
    position: { top: '0%', left: '0%', width: '100%', height: "30%" },
    screen: '(tabs)',
  },
  {
    id: 'current-task',
    title: 'The Plan Tab',
    text: 'You can go to this tab to start planning your day.',
    position: { top: '93%', left: '35%', width: '30%', height: '7%' },
    screen: 'plan',
  },
  {
    id: 'plan-tab',
    title: 'Create Your Tasks',
    text: 'This is where you create new tasks.',
    position: { top: '0%', left: '0%', width: '100%', height:'55%' },
    screen: 'plan',
  },
  {
    id: 'add-task',
    title: 'Calendar',
    text: 'Once you create a task, it will appear in the calendar view. You can see your day at a glance here.',
    position: { top: '50%', left: '0%', width: '100%', height:'100%' },
    screen: 'plan',
  },
  {
    id: 'schedule-view',
    title: 'Settings Tab',
    text: 'This is your settings tab. Here you can customize your experience.',
    position: { top: '0%', left: '0%', width: '100%', height: '100%' },
    screen: 'settings',
  },
  {
    id: 'settings',
    title: 'Daily Reminders',
    text: 'Set a time to get a daily reminder to plan out your day. This way, you spend your time more intentionally.',
    position: { top: '18%', left: '2%', width: '95%', height: "12%" },
    screen: 'settings',
  },
];

export default function Onboarding() {
  const [visible, setVisible] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completed, setCompleted] = useState(true);
  const pathname = usePathname();
  const navigation = useNavigation();

  useEffect(() => {
    checkIfOnboardingCompleted();
  }, []);

  useEffect(() => {
    // Only show steps for the current screen
    const currentScreen = pathname.split('/').pop() || '(tabs)';
    const stepsForCurrentScreen = onboardingSteps.filter(
      step => step.screen === currentScreen
    );

    if (stepsForCurrentScreen.length > 0 && !completed) {
      setVisible(true);

      // Find the first step for this screen
      const firstStepIndex = onboardingSteps.findIndex(
        step => step.screen === currentScreen
      );
      if (firstStepIndex >= 0) {
        setCurrentStepIndex(firstStepIndex);
      }
    }
  }, [pathname, completed]);

  const checkIfOnboardingCompleted = async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
      if (value === null) {
        setCompleted(false);
        setVisible(true);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      setCompleted(true);
      setVisible(false);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < onboardingSteps.length - 1) {
      const nextStep = onboardingSteps[currentStepIndex + 1];
      const currentScreen = pathname.split('/').pop() || '(tabs)';

      if (nextStep.screen !== currentScreen) {
        // Navigate to the next screen
        router.push(nextStep.screen);
      }

      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
      setCompleted(false);
      setCurrentStepIndex(0);
      setVisible(true);
    } catch (error) {
      console.error('Error resetting onboarding status:', error);
    }
  };

  if (!visible || completed) {
    return null;
  }

  const currentStep = onboardingSteps[currentStepIndex];

  return (
    <Modal transparent visible={visible} animationType="fade">
      <SafeAreaView style={styles.container}>
        <View style={styles.overlay}>
          <View style={[styles.spotlight, currentStep.position]}>
            <View style={styles.spotlightInner} />
          </View>

          <View style={[
            styles.tooltipContainer,
            calculateTooltipPosition(currentStep.position)
          ]}>
            <Text style={styles.tooltipTitle}>{currentStep.title}</Text>
            <Text style={styles.tooltipText}>{currentStep.text}</Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                <Text style={styles.nextButtonText}>
                  {currentStepIndex < onboardingSteps.length - 1 ? 'Next' : 'Done'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dotsContainer}>
              {onboardingSteps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentStepIndex ? styles.activeDot : {}
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// Replace the `calculateTooltipPosition` function with this improved version
const TOOLTIP_HEIGHT = 160; // fixed tooltip height
const TOOLTIP_WIDTH = 280;  // fixed tooltip width
const MARGIN = 16;          // padding between tooltip and spotlight

const calculateTooltipPosition = (spotlightPosition: any) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Convert percent values to pixels if necessary
  const parseValue = (value: number | string | undefined, total: number) => {
    if (typeof value === 'string' && value.includes('%')) {
      return (parseFloat(value) / 100) * total;
    }
    return value ?? 0;
  };

  const top = parseValue(spotlightPosition.top, screenHeight);
  const left = parseValue(spotlightPosition.left, screenWidth);
  const width = parseValue(spotlightPosition.width, screenWidth);
  const height = parseValue(spotlightPosition.height, screenHeight);

  // Areas to check for tooltip placement
  const zones = [
    {
      top: MARGIN,
      left: (screenWidth - TOOLTIP_WIDTH) / 2,
      condition: top - TOOLTIP_HEIGHT - MARGIN > 0,
    },
    {
      top: top + height + MARGIN,
      left: (screenWidth - TOOLTIP_WIDTH) / 2,
      condition: top + height + TOOLTIP_HEIGHT + MARGIN < screenHeight,
    },
    {
      top: (screenHeight - TOOLTIP_HEIGHT) / 2,
      left: MARGIN,
      condition: left - TOOLTIP_WIDTH - MARGIN > 0,
    },
    {
      top: (screenHeight - TOOLTIP_HEIGHT) / 2,
      left: left + width + MARGIN,
      condition: left + width + TOOLTIP_WIDTH + MARGIN < screenWidth,
    },
  ];

  // Find the first zone that fits
  for (const zone of zones) {
    if (zone.condition) {
      return {
        position: 'absolute',
        top: zone.top,
        left: zone.left,
        width: TOOLTIP_WIDTH,
        height: TOOLTIP_HEIGHT,
      };
    }
  }

  // Default to bottom center if no space found
  return {
    position: 'absolute',
    bottom: MARGIN,
    left: (screenWidth - TOOLTIP_WIDTH) / 2,
    width: TOOLTIP_WIDTH,
    height: TOOLTIP_HEIGHT,
  };
};
// Export function to reset onboarding for other components
export const resetOnboardingStatus = async () => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
    return true;
  } catch (error) {
    console.error('Error resetting onboarding status:', error);
    return false;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  spotlight: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 150,
    height: 150,
    backgroundColor:'transparent',
    borderRadius: 0,
    overflow: 'hidden',
  },
  spotlightInner: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#fff',
  },
  tooltipContainer: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  tooltipText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  skipButton: {
    padding: 8,
  },
  skipButtonText: {
    color: '#888',
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#007AFF',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
