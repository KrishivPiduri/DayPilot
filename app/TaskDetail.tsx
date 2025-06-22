import React, { useState } from 'react';
import {View, Text, TextInput, Button, StyleSheet, Switch, Alert, Platform, Modal, TouchableOpacity} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function TaskDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { task, onSave, onDelete } = route.params;

    const [title, setTitle] = useState(task.title);
    const [startTime, setStartTime] = useState(new Date(task.startTime));
    const [endTime, setEndTime] = useState(new Date(task.endTime));
    const [important, setImportant] = useState(task.important);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const renderTimePickerModal = (visible, onClose, date, onChange) => {
        if (Platform.OS !== 'ios') return null;
        return (
            <Modal transparent visible={visible} animationType="slide">
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContent}>
                        <DateTimePicker
                            mode="time"
                            display="spinner"
                            value={date}
                            themeVariant="light"
                            onChange={(_, d) => d && onChange(d)}
                            style={styles.picker}
                        />
                        <Button title="Done" onPress={onClose} />
                    </View>
                </View>
            </Modal>
        );
    };

    const saveChanges = () => {
        if (!title.trim()) return Alert.alert('Missing title');
        if (endTime <= startTime) return Alert.alert('Invalid time', 'End must be after start');

        const updatedTask = { ...task, title, startTime, endTime, important };
        onSave(updatedTask);
        navigation.goBack();
    };

    const deleteTask = () => {
        Alert.alert('Delete Task', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: () => {
                    onDelete(task.id);
                    navigation.goBack();
                }
            }
        ]);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Edit Task</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Task Title" />

            <Text style={styles.label}>Start Time</Text>
            <Button title={format(startTime, 'hh:mm a')} onPress={() => setShowStartPicker(true)} />
            {renderTimePickerModal(showStartPicker, () => setShowStartPicker(false), startTime, setStartTime)}

            <Text style={styles.label}>End Time</Text>
            <Button title={format(endTime, 'hh:mm a')} onPress={() => setShowEndPicker(true)} />
            {renderTimePickerModal(showEndPicker, () => setShowEndPicker(false), endTime, setEndTime)}

            <View style={styles.row}>
                <Text>Important</Text>
                <Switch value={important} onValueChange={setImportant} />
            </View>

            <View style={styles.buttonRow}>
                <TouchableOpacity onPress={saveChanges} style={[styles.button, styles.save]}>
                    <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={deleteTask} style={[styles.button, styles.delete]}>
                    <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    // Button container styles
    button: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 4, marginHorizontal: 5 },
    save: { backgroundColor: 'blue' },
    delete: { backgroundColor: 'red' },
    buttonText: { color: 'white', fontWeight: 'bold' },
    container: { flex: 1, padding: 20, backgroundColor: "white" },
    heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    input: { borderBottomWidth: 1, marginBottom: 20, paddingVertical: 8 },
    label: { fontSize: 16, marginTop: 12 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 20 },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 30 },
    modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
    modalContent: { backgroundColor: '#fff', padding: 20 }
});
