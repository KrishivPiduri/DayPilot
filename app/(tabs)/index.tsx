import React, { useState } from 'react';
import {
    FlatList, StyleSheet, Alert, View,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isAfter, isBefore, isSameDay, isWithinInterval } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';

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

    useFocusEffect(
        React.useCallback(() => {
            const loadTasks = async () => {
                const json = await AsyncStorage.getItem(STORAGE_KEY);
                if (json) {
                    const parsed = JSON.parse(json).map((t: any) => ({
                        ...t,
                        startTime: new Date(t.startTime),
                        endTime: new Date(t.endTime),
                    }));
                    setTasks(parsed);
                } else {
                    setTasks([]);
                }
            };
            loadTasks();
        }, [])
    );

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
        <ThemedView style={[styles.taskContainer, isCurrent && styles.currentTaskContainer]} key={task.id}>
            <View style={styles.taskTextWrapper}>
                <ThemedText style={[styles.taskTitle, isCurrent && styles.currentTaskTitle]} numberOfLines={1}>
                    {task.title}
                </ThemedText>
                <ThemedText style={styles.taskTime}>
                    {task.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                    {task.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </ThemedText>
            </View>
            {task.important && <View style={styles.importantDot} />}
        </ThemedView>
    );

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Earlier Today</ThemedText>
            {earlierTasks.length > 0 ? (
                earlierTasks.map(task => renderTask(task))
            ) : (
                <ThemedText>No earlier tasks</ThemedText>
            )}

            <ThemedText type="subtitle" style={[styles.sectionTitle, { marginTop: 32 }]}>Now</ThemedText>
            {currentTask ? renderTask(currentTask, true) : <ThemedText>No current task</ThemedText>}

            <ThemedText type="subtitle" style={[styles.sectionTitle, { marginTop: 32 }]}>Next Up</ThemedText>
            <FlatList
                data={upcomingTasks}
                keyExtractor={item => item.id}
                renderItem={({ item }) => renderTask(item)}
                contentContainerStyle={{ paddingBottom: 16 }}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 48,
        // backgroundColor handled by ThemedView
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        // color handled by ThemedText
        marginBottom: 12,
    },
    taskContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc', // neutral divider
    },
    currentTaskContainer: {},
    taskTextWrapper: {
        flex: 1,
        marginRight: 12,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '400',
        // color handled by ThemedText
    },
    currentTaskTitle: {
        fontWeight: '600',
        // color handled by ThemedText
    },
    taskTime: {
        fontSize: 12,
        // color handled by ThemedText
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
