import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Alert,
    Pressable,
    TextInput,
} from 'react-native';
import { format, setHours, setMinutes, addMinutes } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
    PanGestureHandler,
    GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS,
    useAnimatedGestureHandler,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import TaskEditorScreen from '../EditItem';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();

export default function PlanMainScreen() {
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="PlanMain" component={PlanScreen}/>
            <Stack.Screen name="TaskEditor" component={TaskEditorScreen}/>
        </Stack.Navigator>
    )
}

const STORAGE_KEY = 'PLAN_TASKS';
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 60;
const SNAP_MIN = 15;

function PlanScreen() {
    const navigation = useNavigation();
    const [tasks, setTasks] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [inputTitle, setInputTitle] = useState('');
    const [inputStart, setInputStart] = useState(new Date());
    const [inputEnd, setInputEnd] = useState(addMinutes(new Date(), 30));

    useEffect(() => { loadTasks(); }, []);

    const loadTasks = async () => {
        try {
            const json = await AsyncStorage.getItem(STORAGE_KEY);
            if (json) {
                const parsed = JSON.parse(json);
                const normalized = parsed.map(t => {
                    const startVal = t.start ?? t.startTime;
                    const endVal = t.end ?? t.endTime;
                    return {
                        id: t.id,
                        title: t.title,
                        start: new Date(startVal),
                        end: new Date(endVal),
                    };
                });
                setTasks(normalized);
            }
        } catch {
            Alert.alert('Error loading tasks');
        }
    };

    const saveTasks = async newTasks => {
        setTasks(newTasks);
        const toStore = newTasks.map(t => ({
            id: t.id,
            title: t.title,
            start: t.start.getTime(),
            end: t.end.getTime(),
        }));
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    };

    const openEditModal = task => {
        navigation.navigate('TaskEditor', {
            task,
            onSave: updatedTask => {
                const updated = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
                saveTasks(updated);
            },
            onDelete: toDelete => {
                saveTasks(tasks.filter(t => t.id !== toDelete.id));
            }
        });
    };

    const openNewModal = time => {
        navigation.navigate('TaskEditor', {
            onSave: newTask => {
                saveTasks([...tasks, newTask]);
            },
            task: {
                start: time,
                end: addMinutes(time, 30),
            }
        });
    };


    const handleSave = () => {
        if (!inputTitle.trim()) return Alert.alert('Enter title');
        if (inputEnd <= inputStart) return Alert.alert('End must be after start');
        if (editingTask) {
            const updated = tasks.map(t =>
                t.id === editingTask.id
                    ? { ...t, title: inputTitle, start: inputStart, end: inputEnd }
                    : t
            );
            saveTasks(updated);
        } else {
            const newTask = {
                id: Date.now().toString(),
                title: inputTitle,
                start: inputStart,
                end: inputEnd,
            };
            saveTasks([...tasks, newTask]);
        }
        setModalVisible(false);
    };

    const handleDelete = () => {
        if (!editingTask) return;
        Alert.alert('Delete?', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => {
                    saveTasks(tasks.filter(t => t.id !== editingTask.id));
                    setModalVisible(false);
                }}
        ]);
    };

    const onGridPress = event => {
        const y = event.nativeEvent.locationY;
        const hour = Math.min(Math.max(Math.floor(y / HOUR_HEIGHT), 0), 23);
        const minute = Math.round(((y % HOUR_HEIGHT) / HOUR_HEIGHT) * 60 / SNAP_MIN) * SNAP_MIN;
        const time = setMinutes(setHours(new Date(), hour), minute);
        openNewModal(time);
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.heading}>Your Schedule</Text>
                <Pressable style={styles.grid} onPress={onGridPress}>
                    {HOURS.map(hour => (
                        <View key={hour} style={[styles.hourRow, { top: hour * HOUR_HEIGHT }]}>
                            <Text style={styles.hourLabel}>{format(setHours(new Date(), hour), 'ha')}</Text>
                            <View style={styles.line} />
                        </View>
                    ))}
                    {tasks.map(task => (
                        <DraggableEvent
                            key={task.id}
                            task={task}
                            onUpdate={updated => saveTasks(tasks.map(t => t.id === updated.id ? updated : t))}
                            onTap={() => openEditModal(task)}
                        />
                    ))}
                </Pressable>
            </ScrollView>

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeading}>{editingTask ? 'Edit Event' : 'New Event'}</Text>
                        <Text>Title</Text>
                        <TextInput
                            style={styles.input}
                            value={inputTitle}
                            onChangeText={setInputTitle}
                            placeholder="Event Title"
                        />
                        <Text>Start</Text>
                        <DateTimePicker
                            mode="time"
                            display="spinner"
                            themeVariant="light"
                            value={inputStart}
                            onChange={(_, d) => d && setInputStart(d)}
                        />
                        <Text>End</Text>
                        <DateTimePicker
                            mode="time"
                            display="spinner"
                            themeVariant="light"
                            value={inputEnd}
                            onChange={(_, d) => d && setInputEnd(d)}
                        />
                        <View style={styles.modalButtons}>
                            {editingTask && (
                                <TouchableOpacity onPress={handleDelete} style={styles.delete}>
                                    <Text style={styles.deleteText}>Delete</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={handleSave} style={styles.save}>
                                <Text style={styles.saveText}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancel}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </GestureHandlerRootView>
    );
}

function DraggableEvent({ task, onUpdate, onTap }) {
    const { title, start, end } = task;
    if (isNaN(start) || isNaN(end)) return null;
    const durationMins = (end - start) / 60000;
    const topStart = (start.getHours() * 60 + start.getMinutes()) * (HOUR_HEIGHT / 60);

    const translateY = useSharedValue(topStart);
    const height = useSharedValue(durationMins * (HOUR_HEIGHT / 60));

    const animatedStyle = useAnimatedStyle(() => ({
        position: 'absolute',
        top: translateY.value,
        height: height.value,
        left: 60,
        right: 10,
        backgroundColor: '#4287f5',
        borderRadius: 6,
        padding: 4,
    }));

    const updateTaskTime = useCallback(
        newStartMins => {
            const hours = Math.floor(newStartMins / 60);
            const mins = newStartMins % 60;
            const newStart = setMinutes(setHours(new Date(), hours), mins);
            const newEnd = addMinutes(newStart, durationMins);
            onUpdate({ ...task, start: newStart, end: newEnd });
        },
        [task, durationMins, onUpdate]
    );

    const panHandler = useAnimatedGestureHandler({
        onStart: (_, ctx) => { ctx.startY = translateY.value; },
        onActive: (evt, ctx) => { translateY.value = ctx.startY + evt.translationY; },
        onEnd: () => {
            const totalMins = translateY.value / (HOUR_HEIGHT / 60);
            const snapped = Math.round(totalMins / SNAP_MIN) * SNAP_MIN;
            const snappedY = snapped * (HOUR_HEIGHT / 60);
            translateY.value = withSpring(snappedY);
            runOnJS(updateTaskTime)(snapped);
            runOnJS(onTap)();
        },
    });

    return (
        <PanGestureHandler onGestureEvent={panHandler}>
            <Animated.View style={animatedStyle}>
                <Text style={styles.eventTitle} numberOfLines={1}>{title}</Text>
                <Text style={styles.eventTime}>{format(start, 'hh:mm a')} - {format(end, 'hh:mm a')}</Text>
            </Animated.View>
        </PanGestureHandler>
    );
}

const styles = StyleSheet.create({
    container: { paddingBottom: 100, backgroundColor: "white", paddingTop: 40 },
    save: { backgroundColor: '#007bff', padding: 12, borderRadius: 4, marginRight: 16 },
    cancel: { backgroundColor: 'gray', padding: 12, borderRadius: 4 },
    cancelText: { color: '#fff', fontWeight: '600' },
    saveText: { color: '#fff', fontWeight: '600' },
    heading: { fontSize: 20, fontWeight: '600', margin: 16 },
    grid: { flex: 1, height: HOURS.length * HOUR_HEIGHT },
    hourRow: { position: 'absolute', left: 0, right: 0, height: HOUR_HEIGHT, flexDirection: 'row', alignItems: 'center' },
    hourLabel: { width: 50, textAlign: 'center', fontSize: 12, color: '#555' },
    line: { flex: 1, height: 1, backgroundColor: '#ddd' },
    modalBackdrop: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
    modalContent: { backgroundColor: '#fff', margin: 20, padding: 20, borderRadius: 8 },
    modalHeading: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
    input: { borderBottomWidth: 1, borderColor: '#ccc', marginBottom: 16, padding: 8 },
    modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
    deleteText: { color: 'white', fontWeight: '600', marginRight: 12 },
    delete: { padding: 12, borderRadius: 4, backgroundColor: 'red', marginRight: 16 },
    eventTitle: { color: '#fff', fontWeight: '600' },
    eventTime: { color: '#e0e0e0', fontSize: 10 },
});




