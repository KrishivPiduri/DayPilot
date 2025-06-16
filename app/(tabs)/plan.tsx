import React, { useState } from 'react';
import {
    View, Text, TextInput, Button, FlatList, StyleSheet,
    Switch, Pressable, Alert, Platform, Modal, ScrollView, TouchableOpacity
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, setHours, setMinutes, isBefore, isAfter, isEqual } from 'date-fns';

type Task = {
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
    important: boolean;
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function PlanScreen() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState<Date>(new Date());
    const [endTime, setEndTime] = useState<Date>(new Date());
    const [important, setImportant] = useState(false);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const renderTimePickerModal = (
        visible: boolean,
        onClose: () => void,
        date: Date,
        onChange: (d: Date) => void
    ) => {
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

    const handleAddTask = () => {
        if (!title) return Alert.alert('Missing title', 'Please enter a task title.');
        if (endTime <= startTime) return Alert.alert('Invalid time', 'End time must be after start time.');
        setTasks(prev => [...prev, { id: Date.now().toString(), title, startTime, endTime, important }]);
        setTitle(''); setStartTime(new Date()); setEndTime(new Date()); setImportant(false);
    };

    const renderScheduleView = () => {
        return (
            <ScrollView style={styles.scheduleContainer} contentContainerStyle={styles.scheduleContent}>
                {HOURS.map(hour => {
                    const hourStart = setMinutes(setHours(new Date(), hour), 0);
                    const hourEnd = setMinutes(setHours(new Date(), hour), 59);
                    const hourTasks = tasks.filter(task =>
                        (isBefore(task.startTime, hourEnd) && isAfter(task.endTime, hourStart)) ||
                        isEqual(task.startTime, hourStart) || isEqual(task.endTime, hourEnd)
                    );

                    return (
                        <View key={hour} style={styles.hourBlock}>
                            <Text style={styles.hourLabel}>{format(hourStart, 'hh a')}</Text>
                            <View style={styles.taskRow}>
                                {hourTasks.map(task => (
                                    <View
                                        key={task.id}
                                        style={[styles.taskBlock, task.important && styles.taskImportant]}
                                    >
                                        <Text style={styles.taskText}>{task.title}</Text>
                                        <Text style={styles.taskTime}>{format(task.startTime, 'hh:mm a')} - {format(task.endTime, 'hh:mm a')}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
        );
    };

    return (
        <ScrollView style={styles.container}>
            <ScrollView contentContainerStyle={styles.formContent}>
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

                <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
                    <Text style={styles.addButtonText}>Add Task</Text>
                </TouchableOpacity>

                <Text style={[styles.heading, { marginTop: 32 }]}>Your Schedule</Text>
            </ScrollView>
            {renderScheduleView()}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 48,
        paddingBottom: 32,
        paddingHorizontal: 16
    },
    heading: {
        fontSize: 20,
        fontWeight: '500',
        marginBottom: 16,
        color: '#111'
    },
    label: {
        fontSize: 14,
        marginBottom: 6,
        color: '#333'
    },
    input: {
        borderBottomWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 8,
        marginBottom: 16,
        fontSize: 16
    },
    timeBox: {
        borderBottomWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 12,
        marginBottom: 16
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        justifyContent: 'space-between'
    },
    scheduleContainer: {
        flex: 1,
        marginTop: 8
    },
    scheduleContent: {
        paddingBottom: 100
    },
    hourBlock: {
        borderBottomWidth: 1,
        borderColor: '#eee',
        paddingVertical: 12
    },
    hourLabel: {
        fontSize: 14,
        fontWeight: '400',
        color: '#666',
        marginBottom: 6
    },
    taskRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
    },
    taskBlock: {
        backgroundColor: '#222',
        padding: 8,
        borderRadius: 6,
        flex: 1,
        minWidth: '48%'
    },
    taskImportant: {
        backgroundColor: '#e63946'
    },
    taskText: {
        color: '#fff',
        fontWeight: '500'
    },
    taskTime: {
        color: '#ddd',
        fontSize: 12
    },
    modalBackdrop: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.3)'
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 16,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12
    },
    picker: {
        width: '100%',
        height: 180
    },
    formContent: {
        paddingBottom: 24
    },
    addButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500'
    }
});
