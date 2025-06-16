import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    FlatList,
    StyleSheet,
    Switch,
    Pressable,
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
    const [editTitle, setEditTitle] = useState('');
    const [editTime, setEditTime] = useState('');
    const [editImportant, setEditImportant] = useState(false);

    const handleAddTask = () => {
        if (!title || !time) {
            Alert.alert('Missing fields', 'Please enter both title and time.');
            return;
        }

        const newTask: Task = {
            id: Date.now().toString(),
            title,
            time,
            important,
        };

        setTasks(prev => [...prev, newTask]);
        setTitle('');
        setTime('');
        setImportant(false);
    };

    const startEditing = (task: Task) => {
        setEditingId(task.id);
        setEditTitle(task.title);
        setEditTime(task.time);
        setEditImportant(task.important);
    };

    const cancelEditing = () => {
        setEditingId(null);
    };

    const saveEdit = () => {
        if (!editTitle || !editTime) {
            Alert.alert('Missing fields', 'Please enter both title and time.');
            return;
        }
        setTasks(prev =>
            prev.map(task =>
                task.id === editingId
                    ? { ...task, title: editTitle, time: editTime, important: editImportant }
                    : task
            )
        );
        setEditingId(null);
    };

    const handleDelete = (id: string) => {
        Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => setTasks(prev => prev.filter(t => t.id !== id)) },
        ]);
    };

    const renderItem = ({ item }: { item: Task }) => {
        if (item.id === editingId) {
            return (
                <View style={styles.taskCard}>
                    <TextInput
                        style={styles.input}
                        value={editTitle}
                        onChangeText={setEditTitle}
                        placeholder="Title"
                    />
                    <TextInput
                        style={styles.input}
                        value={editTime}
                        onChangeText={setEditTime}
                        placeholder="Time (e.g. 2:00 PM - 3:00 PM)"
                    />
                    <View style={styles.row}>
                        <Text style={styles.label}>Important:</Text>
                        <Switch value={editImportant} onValueChange={setEditImportant} />
                    </View>
                    <View style={styles.actions}>
                        <Pressable onPress={saveEdit}>
                            <Text style={styles.link}>Save</Text>
                        </Pressable>
                        <Pressable onPress={cancelEditing}>
                            <Text style={[styles.link, { color: '#999' }]}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.taskCard}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <Text style={styles.taskTime}>{item.time}</Text>
                {item.important && <Text style={styles.important}>IMPORTANT</Text>}
                <View style={styles.actions}>
                    <Pressable onPress={() => startEditing(item)}>
                        <Text style={styles.link}>Edit</Text>
                    </Pressable>
                    <Pressable onPress={() => handleDelete(item.id)}>
                        <Text style={[styles.link, { color: '#ff3b30' }]}>Delete</Text>
                    </Pressable>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Add Task</Text>
            <TextInput
                style={styles.input}
                placeholder="Task Title"
                value={title}
                onChangeText={setTitle}
            />
            <TextInput
                style={styles.input}
                placeholder="Time (e.g. 2:00 PM - 3:00 PM)"
                value={time}
                onChangeText={setTime}
            />
            <View style={styles.row}>
                <Text style={styles.label}>Important:</Text>
                <Switch value={important} onValueChange={setImportant} />
            </View>
            <Button title="Add Task" onPress={handleAddTask} />

            <Text style={[styles.heading, { marginTop: 24 }]}>Your Plan</Text>
            <FlatList
                data={tasks}
                keyExtractor={item => item.id}
                renderItem={renderItem}
            />
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
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
    label: { fontSize: 16 },
    taskCard: { backgroundColor: '#f2f2f2', padding: 12, borderRadius: 12, marginBottom: 10 },
    taskTitle: { fontSize: 18, fontWeight: '500' },
    taskTime: { color: '#555', marginVertical: 4 },
    important: { color: '#ff3b30', fontWeight: 'bold' },
    actions: { flexDirection: 'row', marginTop: 8, gap: 20 },
    link: { fontWeight: '600', color: '#007AFF' },
});
