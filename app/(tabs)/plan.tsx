import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    FlatList,
    StyleSheet,
    Pressable,
    Switch,
    Alert,
} from 'react-native';

type Task = {
    id: string;
    title: string;
    time: string;
    important: boolean;
};

export default function PlanScreen() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [title, setTitle] = useState('');
    const [time, setTime] = useState('');
    const [important, setImportant] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleSubmit = () => {
        if (!title || !time) {
            Alert.alert('Missing fields', 'Please enter both title and time.');
            return;
        }

        if (editingId) {
            setTasks((prev) =>
                prev.map((task) =>
                    task.id === editingId
                        ? { ...task, title, time, important }
                        : task
                )
            );
            setEditingId(null);
        } else {
            const newTask: Task = {
                id: Date.now().toString(),
                title,
                time,
                important,
            };
            setTasks((prev) => [...prev, newTask]);
        }

        setTitle('');
        setTime('');
        setImportant(false);
    };

    const handleEdit = (task: Task) => {
        setTitle(task.title);
        setTime(task.time);
        setImportant(task.important);
        setEditingId(task.id);
    };

    const handleDelete = (id: string) => {
        Alert.alert('Delete Task', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    setTasks((prev) => prev.filter((task) => task.id !== id));
                },
            },
        ]);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>{editingId ? 'Edit Task' : 'Add Task'}</Text>
            <TextInput
                style={styles.input}
                placeholder="Task Title"
                value={title}
                onChangeText={setTitle}
            />
            <TextInput
                style={styles.input}
                placeholder="Time (e.g. 10:00 AM - 11:00 AM)"
                value={time}
                onChangeText={setTime}
            />
            <View style={styles.row}>
                <Text style={styles.label}>Important:</Text>
                <Switch value={important} onValueChange={setImportant} />
            </View>
            <Button
                title={editingId ? 'Save Changes' : 'Add Task'}
                onPress={handleSubmit}
            />

            <Text style={[styles.heading, { marginTop: 24 }]}>Your Plan</Text>
            {tasks.length === 0 ? (
                <Text style={{ color: '#888' }}>No tasks yet.</Text>
            ) : (
                <FlatList
                    data={tasks}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.taskCard}>
                            <Text style={styles.taskTitle}>{item.title}</Text>
                            <Text style={styles.taskTime}>{item.time}</Text>
                            {item.important && <Text style={styles.important}>IMPORTANT</Text>}
                            <View style={styles.actions}>
                                <Pressable onPress={() => handleEdit(item)}>
                                    <Text style={styles.link}>Edit</Text>
                                </Pressable>
                                <Pressable onPress={() => handleDelete(item.id)}>
                                    <Text style={[styles.link, { color: '#ff3b30' }]}>Delete</Text>
                                </Pressable>
                            </View>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#fff' },
    heading: { fontSize: 22, fontWeight: '600', marginBottom: 12 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    label: { fontSize: 16 },
    taskCard: {
        backgroundColor: '#f2f2f2',
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
    },
    taskTitle: { fontSize: 18, fontWeight: '500' },
    taskTime: { color: '#555', marginVertical: 4 },
    important: { color: '#ff3b30', fontWeight: 'bold' },
    actions: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 20,
    },
    link: {
        fontWeight: '600',
        color: '#007AFF',
    },
});
