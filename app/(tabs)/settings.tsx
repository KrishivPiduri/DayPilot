import React, { useEffect, useState } from 'react';
import { View, Pressable, Platform, StyleSheet, Alert, Switch, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import * as Notifications from 'expo-notifications';
import { resetOnboardingStatus } from '@/components/Onboarding';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeContext } from '@/hooks/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';

const TIMEZONE_KEY = 'settings_timezone';
const REMINDER_TIME_KEY = 'settings_reminder_time';
const NOTIFICATION_ID_KEY = 'settings_notification_id';
const NOTIFICATIONS_ENABLED_KEY = 'settings_notifications_enabled';

const TIMEZONES = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Kolkata'
];

export default function SettingsPage() {
    const { themePref, setThemePref, theme } = useThemeContext();
    const [timezone, setTimezone] = useState(Localization.timezone);
    const [reminderTime, setReminderTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Get theme colors for UI elements
    const textColor = useThemeColor({}, 'text');
    const backgroundColor = useThemeColor({}, 'background');
    const cardBackgroundColor = useThemeColor({ light: '#f5f5f5', dark: '#2a2a2a' }, 'card');
    const buttonBackgroundColor = useThemeColor({ light: '#e0e0e0', dark: '#3a3a3a' }, 'buttonBackground');
    const accentColor = useThemeColor({ light: '#000000', dark: '#ffffff' }, 'tint');

    useEffect(() => {
        (async () => {
            const storedTimezone = await AsyncStorage.getItem(TIMEZONE_KEY);
            const storedReminderTime = await AsyncStorage.getItem(REMINDER_TIME_KEY);
            const storedNotificationsEnabled = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);

            if (storedTimezone) setTimezone(storedTimezone);
            if (storedReminderTime) {
                setReminderTime(new Date(storedReminderTime));
            } else {
                const defaultTime = new Date();
                defaultTime.setHours(9, 0, 0, 0);
                await AsyncStorage.setItem(REMINDER_TIME_KEY, defaultTime.toISOString());
                setReminderTime(defaultTime);
            }

            setNotificationsEnabled(storedNotificationsEnabled !== 'false');
        })();
    }, []);

    const scheduleReminderNotification = async (time) => {
        const existingId = await AsyncStorage.getItem(NOTIFICATION_ID_KEY);
        if (existingId) {
            try { await Notifications.cancelScheduledNotificationAsync(existingId); } catch {}
        }

        if (!notificationsEnabled) return;

        const identifier = await Notifications.scheduleNotificationAsync({
            content: {
                title: "Schedule Your Day",
                body: "Don't forget to plan out your day!",
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour: time.getHours(),
                minute: time.getMinutes()
            },
        });

        await AsyncStorage.setItem(NOTIFICATION_ID_KEY, identifier);
    };

    const saveSettings = async () => {
        setIsSaving(true);
        try {
            await AsyncStorage.setItem(TIMEZONE_KEY, timezone);
            await AsyncStorage.setItem(REMINDER_TIME_KEY, reminderTime.toISOString());
            await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, notificationsEnabled.toString());

            if (notificationsEnabled) {
                await scheduleReminderNotification(reminderTime);
            } else {
                const existingId = await AsyncStorage.getItem(NOTIFICATION_ID_KEY);
                if (existingId) {
                    try { await Notifications.cancelScheduledNotificationAsync(existingId); } catch {}
                    await AsyncStorage.removeItem(NOTIFICATION_ID_KEY);
                }
            }
        } catch (error) {
            Alert.alert('Error', 'There was a problem saving your settings.');
        } finally {
            setShowTimePicker(false);
            setIsSaving(false);
        }
    };

    const handleRestartTutorial = async () => {
        const success = await resetOnboardingStatus();
        if (success) {
            Alert.alert(
                "Tutorial Reset",
                "The app tutorial will show again when you navigate to different screens."
            );
        }
    };
    // Clear all AsyncStorage data
    const handleClearStorage = async () => {
        Alert.alert(
            'Clear All Data?',
            'This will remove all settings and tasks. Proceed?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: async () => {
                    try {
                        await AsyncStorage.clear();
                        Alert.alert('Done', 'All data has been cleared.');
                    } catch {
                        Alert.alert('Error', 'Failed to clear data.');
                    }
                } }
            ]
        );
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer}>
             <ThemedText type="title" style={styles.title}>Settings</ThemedText>
            {/* Theme selection */}
            <View style={styles.section}>
                <ThemedText style={styles.label}>Theme</ThemedText>
                <View style={[styles.pickerWrapper, { backgroundColor: cardBackgroundColor }]}>
                    <Picker
                        selectedValue={themePref}
                        onValueChange={(val) => setThemePref(val)}
                        style={[styles.picker, { color: textColor }]}
                        dropdownIconColor={textColor}
                    >
                        <Picker.Item label="System" value="system" color={theme === 'dark' ? '#ffffff' : '#1a1a1a'} />
                        <Picker.Item label="Light" value="light" color={theme === 'dark' ? '#ffffff' : '#1a1a1a'} />
                        <Picker.Item label="Dark" value="dark" color={theme === 'dark' ? '#ffffff' : '#1a1a1a'} />
                    </Picker>
                </View>
            </View>

            <View style={styles.section}>
                <ThemedText style={styles.label}>Timezone</ThemedText>
                <View style={[styles.pickerWrapper, { backgroundColor: cardBackgroundColor }]}>
                    <Picker
                        selectedValue={timezone}
                        onValueChange={(itemValue) => setTimezone(itemValue)}
                        style={[styles.picker, { color: textColor }]}
                        dropdownIconColor={textColor}
                    >
                        {TIMEZONES.map((tz) => (
                            <Picker.Item
                                key={tz}
                                label={tz}
                                value={tz}
                                color={theme === 'dark' ? '#ffffff' : '#1a1a1a'}
                            />
                        ))}
                    </Picker>
                </View>
            </View>

            <View style={styles.reminderSection}>
                <ThemedText style={styles.label}>Daily Reminder</ThemedText>
                <View style={styles.switchRow}>
                    <ThemedText style={styles.inputText}>Enable Notifications</ThemedText>
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={setNotificationsEnabled}
                        trackColor={{ false: '#767577', true: accentColor }}
                    />
                </View>
                {notificationsEnabled && (
                    <>
                        <ThemedText style={styles.label}>Reminder Time</ThemedText>
                        <Pressable
                            style={[styles.inputButton, { backgroundColor: cardBackgroundColor }]}
                            onPress={() => setShowTimePicker(true)}
                        >
                            <ThemedText style={styles.inputText}>{reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</ThemedText>
                        </Pressable>
                        {showTimePicker && (
                            <DateTimePicker
                                value={reminderTime}
                                mode="time"
                                is24Hour={true}
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                themeVariant={theme}
                                onChange={(event, selectedDate) => {
                                    if (event.type !== 'dismissed' && selectedDate) {
                                        setReminderTime(selectedDate);
                                    }
                                    if (Platform.OS !== 'ios') setShowTimePicker(false);
                                }}
                            />
                        )}
                    </>
                )}
            </View>

            <View style={styles.section}>
                <ThemedText style={styles.sectionHeader}>Help & Support</ThemedText>
                <Pressable
                    style={[styles.optionButton, { backgroundColor: buttonBackgroundColor }]}
                    onPress={handleRestartTutorial}
                >
                    <ThemedText style={styles.optionButtonText}>Restart App Tutorial</ThemedText>
                </Pressable>
            </View>
            <View style={styles.section}>
                <ThemedText style={styles.sectionHeader}>Danger Zone</ThemedText>
                <Pressable
                    style={[styles.optionButton, { backgroundColor: buttonBackgroundColor }]}
                    onPress={handleClearStorage}
                >
                    <ThemedText style={[styles.optionButtonText, { color: 'red' }]}>Clear All Data</ThemedText>
                </Pressable>
            </View>

            <Pressable
                style={[styles.saveButton, { backgroundColor: accentColor }, isSaving && { opacity: 0.6 }]}
                onPress={saveSettings}
                disabled={isSaving}
            >
                <ThemedText style={[styles.saveButtonText, { color: backgroundColor }]}>
                    {isSaving ? 'Saving...' : 'Save Settings'}
                </ThemedText>
            </Pressable>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    contentContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        marginBottom: 32,
    },
    section: {
        marginBottom: 28,
    },
    reminderSection: {
        marginVertical: 30
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 6,
    },
    pickerWrapper: {
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 16,
    },
    picker: {
        height: 200,
        width: '100%',
    },
    inputButton: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 6,
    },
    inputText: {
        fontSize: 16,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    saveButton: {
        paddingVertical: 12,
        borderRadius: 6,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    optionButton: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 6,
        alignItems: 'center',
    },
    optionButtonText: {
        fontSize: 16,
    },
});
