import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Platform, TextInput, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

const TIMEZONE_KEY = 'settings_timezone';
const REMINDER_TIME_KEY = 'settings_reminder_time';

export default function SettingsPage() {
    const [timezone, setTimezone] = useState(Localization.timezone);
    const [reminderTime, setReminderTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);

    useEffect(() => {
        (async () => {
            const storedTimezone = await AsyncStorage.getItem(TIMEZONE_KEY);
            const storedReminderTime = await AsyncStorage.getItem(REMINDER_TIME_KEY);
            if (storedTimezone) setTimezone(storedTimezone);
            if (storedReminderTime) setReminderTime(new Date(storedReminderTime));
        })();
    }, []);

    const saveSettings = async () => {
        await AsyncStorage.setItem(TIMEZONE_KEY, timezone);
        await AsyncStorage.setItem(REMINDER_TIME_KEY, reminderTime.toISOString());
        setShowTimePicker(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Settings</Text>

            <View style={styles.section}>
                <Text style={styles.label}>Timezone</Text>
                <TextInput
                    style={styles.textInput}
                    value={timezone}
                    editable={false}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Reminder Time</Text>
                <Pressable style={styles.inputButton} onPress={() => setShowTimePicker(true)}>
                    <Text style={styles.inputText}>{reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </Pressable>
                {showTimePicker && (
                    <DateTimePicker
                        value={reminderTime}
                        mode="time"
                        is24Hour={true}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        themeVariant={"light"}
                        onChange={(event, selectedDate) => {
                            const currentDate = selectedDate || reminderTime;
                            setShowTimePicker(Platform.OS === 'ios');
                            setReminderTime(currentDate);
                        }}
                    />
                )}
            </View>

            <Pressable style={styles.saveButton} onPress={saveSettings}>
                <Text style={styles.saveButtonText}>Save Settings</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        marginBottom: 32,
        color: '#2e2e2e',
    },
    section: {
        marginBottom: 28,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#3b3b3b',
        marginBottom: 6,
    },
    textInput: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        backgroundColor: '#f5f5f5',
        borderRadius: 6,
        fontSize: 16,
        color: '#1a1a1a',
    },
    inputButton: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        backgroundColor: '#f5f5f5',
        borderRadius: 6,
    },
    inputText: {
        fontSize: 16,
        color: '#1a1a1a',
    },
    saveButton: {
        backgroundColor: '#000000',
        paddingVertical: 12,
        borderRadius: 6,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '500',
    },
});
