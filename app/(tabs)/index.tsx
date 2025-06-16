import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';

const mockTasks = [
    { id: '1', title: 'Morning Workout', time: '7:00 AM - 7:30 AM', important: true },
    { id: '2', title: 'Daily Planning', time: '7:30 AM - 8:00 AM', important: false },
    { id: '3', title: 'Team Meeting', time: '9:00 AM - 9:45 AM', important: true },
    { id: '4', title: 'Coding Session', time: '10:00 AM - 12:00 PM', important: false },
];

export default function TodayScreen() {
    const currentTaskIndex = 1; // "Daily Planning" is current
    const currentTask = mockTasks[currentTaskIndex];
    const upcomingTasks = mockTasks.slice(currentTaskIndex + 1);

    const renderTask = (task: typeof mockTasks[0], isCurrent = false) => (
        <View style={[styles.taskContainer, isCurrent && styles.currentTaskContainer]} key={task.id}>
            <View style={styles.taskTextWrapper}>
                <Text style={[styles.taskTitle, isCurrent && styles.currentTaskTitle]} numberOfLines={1}>
                    {task.title}
                </Text>
                <Text style={styles.taskTime}>{task.time}</Text>
            </View>
            {task.important && <View style={styles.importantDot} />}
            <Link href={`/task/${task.id}`} asChild>
                <Pressable>
                    <Text style={styles.editLink}>Edit</Text>
                </Pressable>
            </Link>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Now</Text>
            {renderTask(currentTask, true)}

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
    currentTaskContainer: {
        // No heavy styling here, just subtle emphasis via text color
    },
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
    editLink: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '500',
    },
});
