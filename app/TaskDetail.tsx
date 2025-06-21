import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch, Alert } from 'react-native';
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
    const [showStart, setShowStart] = useState(false);
    const [showEnd, setShowEnd] = useState(false);

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
            <Button title={format(startTime, 'hh:mm a')} onPress={() => setShowStart(true)} />
            {showStart && (
                <DateTimePicker
                    mode="time"
                    value={startTime}
                    onChange={(_, date) => {
                        setShowStart(false);
                        if (date) setStartTime(date);
                    }}
                />
            )}

            <Text style={styles.label}>End Time</Text>
            <Button title={format(endTime, 'hh:mm a')} onPress={() => setShowEnd(true)} />
            {showEnd && (
                <DateTimePicker
                    mode="time"
                    value={endTime}
                    onChange={(_, date) => {
                        setShowEnd(false);
                        if (date) setEndTime(date);
                    }}
                />
            )}

            <View style={styles.row}>
                <Text>Important</Text>
                <Switch value={important} onValueChange={setImportant} />
            </View>

            <View style={styles.buttonRow}>
                <Button title="Save" onPress={saveChanges} />
                <Button title="Delete" onPress={deleteTask} color="red" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    input: { borderBottomWidth: 1, marginBottom: 20, paddingVertical: 8 },
    label: { fontSize: 16, marginTop: 12 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 20 },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 30 }
});
