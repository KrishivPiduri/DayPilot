import { useEffect, useState } from 'react';
import {
    View, Text, FlatList, StyleSheet, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isAfter, isBefore, isSameDay, isWithinInterval } from 'date-fns';

type Task = {
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
    important: boolean;
};

const STORAGE_KEY = 'PLAN_TASKS';

export default function TodayScreen() {
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        const loadTasks = async () => {
            try {
                const json = await AsyncStorage.getItem(STORAGE_KEY);
                if (json) {
                    const parsed = JSON.parse(json).map((t: any) => ({
                        ...t,
                        startTime: new Date(t.startTime),
                        endTime: new Date(t.endTime),
                    }));
                    setTasks(parsed);
                }
            } catch (err) {
                Alert.alert('Error loading tasks');
            }
        };
        loadTasks();
    }, []);

    const now = new Date();

    const earlierTasks = tasks
        .filter(t => isBefore(t.endTime, now) && isSameDay(t.startTime, now))
        .sort((a, b) => b.endTime.getTime() - a.endTime.getTime());

    const currentTask = tasks.find(t =>
        isWithinInterval(now, { start: t.startTime, end: t.endTime })
    );

    const upcomingTasks = tasks
        .filter(t => isAfter(t.startTime, now) && isSameDay(t.startTime, now))
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    const renderTask = (task: Task, isCurrent = false) => (
        <View style={[styles.taskContainer, isCurrent && styles.currentTaskContainer]} key={task.id}>
            <View style={styles.taskTextWrapper}>
                <Text style={[styles.taskTitle, isCurrent && styles.currentTaskTitle]} numberOfLines={1}>
                    {task.title}
                </Text>
                <Text style={styles.taskTime}>
                    {task.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                    {task.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
            {task.important && <View style={styles.importantDot} />}
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Earlier Today</Text>
            {earlierTasks.length > 0 ? (
                earlierTasks.map(task => renderTask(task))
            ) : (
                <Text>No earlier tasks</Text>
            )}

            <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Now</Text>
            {currentTask ? renderTask(currentTask, true) : <Text>No current task</Text>}

            <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Next Up</Text>
            <FlatList
                data={upcomingTasks}
                keyExtractor={item => item.id}
                renderItem={({ item }) => renderTask(item)}
                contentContainerStyle={{ paddingBottom: 16 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 24,
        backgroundColor: '#fff',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#222',
        marginBottom: 12,
    },
    taskContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    currentTaskContainer: {},
    taskTextWrapper: {
        flex: 1,
        marginRight: 12,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '400',
        color: '#444',
    },
    currentTaskTitle: {
        fontWeight: '600',
        color: '#000',
    },
    taskTime: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    importantDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ff3b30',
        marginRight: 12,
    },
});
