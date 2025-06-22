// TaskEditorScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function TaskEditorScreen({ route }) {
    const navigation = useNavigation();
    const { task, onSave, onDelete } = route.params;

    const [inputTitle, setInputTitle] = useState(task?.title || '');
    const [inputStart, setInputStart] = useState(task?.start ? new Date(task.start) : new Date());
    const [inputEnd, setInputEnd] = useState(task?.end ? new Date(task.end) : new Date(new Date().getTime() + 30 * 60000));

    const handleSave = () => {
        if (!inputTitle.trim()) return Alert.alert('Enter title');
        if (inputEnd <= inputStart) return Alert.alert('End must be after start');

        const updatedTask = {
            id: task?.id || Date.now().toString(),
            title: inputTitle,
            start: inputStart,
            end: inputEnd,
        };
        onSave(updatedTask);
        navigation.goBack();
    };

    const handleDelete = () => {
        if (task && onDelete) {
            onDelete(task);
            navigation.goBack();
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>{task ? 'Edit Event' : 'New Event'}</Text>
            <TextInput
                style={styles.input}
                placeholder="Title"
                value={inputTitle}
                onChangeText={setInputTitle}
            />
            <Text>Start</Text>
            <DateTimePicker value={inputStart} mode="time" display="spinner" themeVariant="light" onChange={(_, d) => d && setInputStart(d)} />
            <Text>End</Text>
            <DateTimePicker value={inputEnd} mode="time" display="spinner" themeVariant="light" onChange={(_, d) => d && setInputEnd(d)} />

            <View style={styles.buttons}>
                {task && (
                    <TouchableOpacity style={styles.delete} onPress={handleDelete}>
                        <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.save} onPress={handleSave}>
                    <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: "white" },
    heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
    input: { borderBottomWidth: 1, borderColor: '#ccc', marginBottom: 16, padding: 8 },
    buttons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    save: { backgroundColor: '#007bff', padding: 12, borderRadius: 4 },
    delete: { backgroundColor: 'red', padding: 12, borderRadius: 4 },
    buttonText: { color: 'white', fontWeight: 'bold' },
});
