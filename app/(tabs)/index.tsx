import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';

const mockTasks = [
    {
        id: '1',
        title: 'Morning Workout',
        time: '7:00 AM - 7:30 AM',
        important: true,
    },
    {
        id: '2',
        title: 'Daily Planning',
        time: '7:30 AM - 8:00 AM',
        important: false,
    },
    {
        id: '3',
        title: 'Team Meeting',
        time: '9:00 AM - 9:45 AM',
        important: true,
    },
    {
        id: '4',
        title: 'Coding Session',
        time: '10:00 AM - 12:00 PM',
        important: false,
    },
];

export default function TodayScreen() {
    const currentTaskIndex = 1; // Simulate "Daily Planning" is current

    const currentTask = mockTasks[currentTaskIndex];
    const upcomingTasks = mockTasks.slice(currentTaskIndex + 1);

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Now</Text>
            <View style={[styles.taskCard, styles.currentTask]}>
                <Text style={styles.taskTitle}>{currentTask.title}</Text>
                <Text style={styles.taskTime}>{currentTask.time}</Text>
                {currentTask.important && <Text style={styles.important}>IMPORTANT</Text>}
                <Link href={`/task/${currentTask.id}`} asChild>
                    <Pressable style={styles.link}>
                        <Text style={styles.linkText}>Edit Task</Text>
                    </Pressable>
                </Link>
            </View>

            <Text style={styles.heading}>Next Up</Text>
            <FlatList
                data={upcomingTasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.taskCard}>
                        <Text style={styles.taskTitle}>{item.title}</Text>
                        <Text style={styles.taskTime}>{item.time}</Text>
                        {item.important && <Text style={styles.important}>IMPORTANT</Text>}
                        <Link href={`/task/${item.id}`} asChild>
                            <Pressable style={styles.link}>
                                <Text style={styles.linkText}>Edit Task</Text>
                            </Pressable>
                        </Link>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    heading: {
        fontSize: 22,
        fontWeight: '600',
        marginVertical: 8,
    },
    taskCard: {
        backgroundColor: '#f2f2f2',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    currentTask: {
        borderLeftWidth: 5,
        borderLeftColor: '#007AFF',
    },
    taskTitle: {
        fontSize: 18,
        fontWeight: '500',
    },
    taskTime: {
        fontSize: 14,
        color: '#555',
        marginVertical: 4,
    },
    important: {
        color: '#ff3b30',
        fontWeight: 'bold',
    },
    link: {
        marginTop: 6,
    },
    linkText: {
        color: '#007AFF',
        fontWeight: '600',
    },
});
