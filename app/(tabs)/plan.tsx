import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, Button, ScrollView, StyleSheet,
    Switch, Pressable, Alert, Platform, Modal, TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, setHours, setMinutes } from 'date-fns';

const STORAGE_KEY = 'PLAN_TASKS';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const TIMELINE_HEIGHT = 24 * 60; // 1440 pixels for 24 hours, 1 px per minute

export default function PlanScreen() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [important, setImportant] = useState(false);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState(null);

    useEffect(() => { loadTasks(); }, []);

    const loadTasks = async () => {
        try {
            const json = await AsyncStorage.getItem(STORAGE_KEY);
            if (json) setTasks(JSON.parse(json).map(t => ({ ...t, startTime: new Date(t.startTime), endTime: new Date(t.endTime) })));
        } catch {
            Alert.alert('Error loading tasks');
        }
    };

    const saveTasks = async (newTasks) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
            setTasks(newTasks);
        } catch {
            Alert.alert('Error saving tasks');
        }
    };

    const handleAddTask = () => {
        if (!title.trim()) return Alert.alert('Missing title', 'Please enter a task title.');
        if (endTime <= startTime) return Alert.alert('Invalid time', 'End time must be after start time.');

        const newTasks = [...tasks, { id: Date.now().toString(), title: title.trim(), startTime, endTime, important }];
        saveTasks(newTasks);

        setTitle(''); setStartTime(new Date()); setEndTime(new Date()); setImportant(false);
    };

    const openEditModal = (task) => {
        setEditingTaskId(task.id);
        setTitle(task.title);
        setStartTime(task.startTime);
        setEndTime(task.endTime);
        setImportant(task.important);
        setEditModalVisible(true);
    };

    const handleSaveEdit = () => {
        if (!title.trim()) return Alert.alert('Missing title', 'Please enter a task title.');
        if (endTime <= startTime) return Alert.alert('Invalid time', 'End time must be after start time.');
        if (!editingTaskId) return;

        const updatedTasks = tasks.map(t =>
            t.id === editingTaskId ? { ...t, title: title.trim(), startTime, endTime, important } : t
        );
        saveTasks(updatedTasks);
        closeEditModal();
    };

    const handleDelete = () => {
        if (!editingTaskId) return;
        Alert.alert('Delete Task', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => {
                    const filtered = tasks.filter(t => t.id !== editingTaskId);
                    saveTasks(filtered);
                    closeEditModal();
                }}
        ]);
    };

    const closeEditModal = () => {
        setEditModalVisible(false);
        setEditingTaskId(null);
        setTitle('');
        setStartTime(new Date());
        setEndTime(new Date());
        setImportant(false);
    };

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
                            onChange={(_, d) => d && onChange(d)}
                            style={styles.picker}
                            textColor="#000"
                        />
                        <Button title="Done" onPress={onClose} />
                    </View>
                </View>
            </Modal>
        );
    };

    const minutesFromMidnight = (date) => date.getHours() * 60 + date.getMinutes();

    const renderScheduleView = () => (
        <ScrollView style={styles.scheduleContainer} contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={styles.timelineContainer}>
                <View style={styles.hourLabels}>
                    {HOURS.map(hour => (
                        <Text key={hour} style={styles.hourLabel}>
                            {format(setMinutes(setHours(new Date(), hour), 0), 'ha')}
                        </Text>
                    ))}
                </View>

                <View style={styles.timeline}>
                    {HOURS.map(hour => (
                        <View key={`line-${hour}`} style={[styles.hourLine, { top: hour * 60 }]} />
                    ))}

                    {tasks.map(task => {
                        const startMins = minutesFromMidnight(task.startTime);
                        const endMins = minutesFromMidnight(task.endTime);
                        const top = startMins;
                        const height = Math.max(endMins - startMins, 15);

                        return (
                            <TouchableOpacity
                                key={task.id}
                                style={[
                                    styles.taskBlock,
                                    task.important && styles.taskImportant,
                                    { top, height }
                                ]}
                                onPress={() => openEditModal(task)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.taskText} numberOfLines={1}>{task.title}</Text>
                                <Text style={styles.taskTime}>
                                    {format(task.startTime, 'hh:mm a')} - {format(task.endTime, 'hh:mm a')}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </ScrollView>
    );

    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
            <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
                <Text style={styles.heading}>Add Task</Text>
                <Text style={styles.label}>Title</Text>
                <TextInput style={styles.input} placeholder="Task Title" value={title} onChangeText={setTitle} />

                <Text style={styles.label}>Start Time</Text>
                <Pressable onPress={() => setShowStartPicker(true)} style={styles.timeBox}>
                    <Text>{format(startTime, 'hh:mm a')}</Text>
                </Pressable>
                {renderTimePickerModal(showStartPicker, () => setShowStartPicker(false), startTime, setStartTime)}

                <Text style={styles.label}>End Time</Text>
                <Pressable onPress={() => setShowEndPicker(true)} style={styles.timeBox}>
                    <Text>{format(endTime, 'hh:mm a')}</Text>
                </Pressable>
                {renderTimePickerModal(showEndPicker, () => setShowEndPicker(false), endTime, setEndTime)}

                <View style={styles.row}>
                    <Text style={styles.label}>Important</Text>
                    <Switch value={important} onValueChange={setImportant} />
                </View>

                {editingTaskId === null ? (
                    <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
                        <Text style={styles.addButtonText}>Add Task</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.editButtonsRow}>
                        <TouchableOpacity style={[styles.addButton, { backgroundColor: '#28a745' }]} onPress={handleSaveEdit}>
                            <Text style={styles.addButtonText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.addButton, { backgroundColor: '#dc3545', marginLeft: 12 }]} onPress={handleDelete}>
                            <Text style={styles.addButtonText}>Delete</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.addButton, { backgroundColor: '#6c757d', marginLeft: 12 }]} onPress={closeEditModal}>
                            <Text style={styles.addButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <Text style={[styles.heading, { marginTop: 32 }]}>Your Schedule</Text>
            </ScrollView>
            {renderScheduleView()}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingTop: 48, paddingBottom: 32, paddingHorizontal: 16 },
    heading: { fontSize: 20, fontWeight: '500', marginBottom: 16, color: '#111' },
    label: { fontSize: 14, marginBottom: 6, color: '#333' },
    input: { borderBottomWidth: 1, borderColor: '#ccc', paddingVertical: 8, marginBottom: 16, fontSize: 16 },
    timeBox: { borderBottomWidth: 1, borderColor: '#ccc', paddingVertical: 12, marginBottom: 16 },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, justifyContent: 'space-between' },
    scheduleContainer: { flex: 1, marginTop: 8 },
    formContent: { paddingBottom: 24 },

    timelineContainer: {
        flexDirection: 'row',
        position: 'relative',
        height: TIMELINE_HEIGHT,
        marginTop: 16,
    },
    hourLabels: {
        width: 50,
        borderRightWidth: 1,
        borderColor: '#ccc',
        alignItems: 'flex-end',
        paddingRight: 8,
    },
    hourLabel: {
        height: 60,
        fontSize: 12,
        color: '#666',
        textAlign: 'right',
        paddingTop: 2,
    },
    timeline: {
        flex: 1,
        position: 'relative',
        borderLeftWidth: 1,
        borderColor: '#ccc',
    },
    hourLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: '#ddd',
    },
    taskBlock: {
        position: 'absolute',
        left: 8,
        right: 8,
        backgroundColor: '#222',
        borderRadius: 6,
        padding: 8,
        zIndex: 1,
    },
    taskImportant: { backgroundColor: '#e63946' },
    taskText: { color: '#fff', fontWeight: '500', fontSize: 14 },
    taskTime: { color: '#ddd', fontSize: 12, marginTop: 2 },

    modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
    modalContent: { backgroundColor: '#fff', padding: 20 },

    addButton: {
        backgroundColor: '#007bff',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
        paddingHorizontal: 16,
    },
    addButtonText: { color: 'white', fontWeight: '600', fontSize: 16 },
    editButtonsRow: { flexDirection: 'row', justifyContent: 'flex-start', marginTop: 8 },
});
