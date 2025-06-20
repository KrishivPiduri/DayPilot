import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'tasksForTomorrow';

type Task = {
    text: string;
    createdAt: number; // timestamp in ms
};

export default function TasksForTomorrow() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [input, setInput] = useState('');

    // Filter out tasks older than today
    const filterExpiredTasks = (taskList: Task[]) => {
        const now = new Date();

        // Get start of today
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Get start of yesterday
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);

        return taskList.filter(task => task.createdAt >= yesterdayStart.getTime());
    };


    // Load and clean up tasks
    useEffect(() => {
        (async () => {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed: Task[] = JSON.parse(stored);
                const validTasks = filterExpiredTasks(parsed);
                setTasks(validTasks);
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(validTasks));
            }
        })();
    }, []);

    // Save tasks on update
    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }, [tasks]);

    const addTask = () => {
        if (input.trim() === '') return;
        const newTask: Task = {
            text: input.trim(),
            createdAt: Date.now(),
        };
        setTasks(prev => [newTask, ...prev]);
        setInput('');
    };

    const deleteTask = (index: number) => {
        setTasks(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.select({ ios: 'padding', android: undefined })}
            style={styles.container}
        >
            <Text style={styles.heading}>🗓 Tasks for Tomorrow</Text>

            <View style={styles.inputRow}>
                <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder="Add a task..."
                    style={styles.input}
                />
                <TouchableOpacity onPress={addTask} style={styles.addButton}>
                    <Text style={styles.addText}>+</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={tasks}
                keyExtractor={(item, index) => `${item.text}-${item.createdAt}-${index}`}
                renderItem={({ item, index }) => (
                    <View style={styles.taskRow}>
                        <Text style={styles.taskText}>{item.text}</Text>
                        <TouchableOpacity onPress={() => deleteTask(index)}>
                            <Text style={styles.deleteText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.empty}>No tasks yet. Add some!</Text>
                }
                contentContainerStyle={{ paddingBottom: 100 }}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    heading: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 20,
    },
    inputRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    input: {
        flex: 1,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 44,
    },
    addButton: {
        backgroundColor: '#007AFF',
        marginLeft: 8,
        borderRadius: 8,
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '600',
    },
    taskRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
    },
    taskText: {
        fontSize: 16,
        flexShrink: 1,
    },
    deleteText: {
        color: '#FF3B30',
        fontSize: 18,
        paddingHorizontal: 10,
    },
    empty: {
        marginTop: 30,
        textAlign: 'center',
        color: '#999',
        fontStyle: 'italic',
    },
});
