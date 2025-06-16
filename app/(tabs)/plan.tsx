import React, { useState } from 'react';
import {
    View, Text, TextInput, Button, FlatList, StyleSheet,
    Switch, Pressable, Alert, Platform, Modal
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

type Task = {
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
    important: boolean;
};

export default function PlanScreen() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState<Date>(new Date());
    const [endTime, setEndTime] = useState<Date>(new Date());
    const [important, setImportant] = useState(false);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editStartTime, setEditStartTime] = useState<Date>(new Date());
    const [editEndTime, setEditEndTime] = useState<Date>(new Date());
    const [editImportant, setEditImportant] = useState(false);
    const [showEditStartPicker, setShowEditStartPicker] = useState(false);
    const [showEditEndPicker, setShowEditEndPicker] = useState(false);

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

    const startEditing = (task: Task) => {
        setEditingId(task.id);
        setEditTitle(task.title);
        setEditStartTime(task.startTime);
        setEditEndTime(task.endTime);
        setEditImportant(task.important);
    };

    const saveEdit = () => {
        if (!editTitle) return Alert.alert('Missing title', 'Please enter a task title.');
        if (editEndTime <= editStartTime) return Alert.alert('Invalid time', 'End time must be after start time.');
        setTasks(prev => prev.map(t => t.id === editingId
            ? { ...t, title: editTitle, startTime: editStartTime, endTime: editEndTime, important: editImportant }
            : t
        ));
        setEditingId(null);
    };

    const cancelEditing = () => setEditingId(null);

    const handleDelete = (id: string) => {
        Alert.alert('Delete Task','Are you sure?',[
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => setTasks(prev => prev.filter(t => t.id !== id)) }
        ]);
    };

    const renderItem = ({ item }: { item: Task }) => {
        if (item.id === editingId) {
            return (
                <View style={styles.taskCard}>
                    <Text style={styles.label}>Title:</Text>
                    <TextInput style={styles.input} value={editTitle} onChangeText={setEditTitle} />

                    <Text style={styles.label}>Start Time:</Text>
                    <Pressable onPress={() => setShowEditStartPicker(true)} style={styles.timeBox}>
                        <Text>{format(editStartTime,'hh:mm a')}</Text>
                    </Pressable>
                    {renderTimePickerModal(showEditStartPicker,()=>setShowEditStartPicker(false),editStartTime,setEditStartTime)}

                    <Text style={styles.label}>End Time:</Text>
                    <Pressable onPress={() => setShowEditEndPicker(true)} style={styles.timeBox}>
                        <Text>{format(editEndTime,'hh:mm a')}</Text>
                    </Pressable>
                    {renderTimePickerModal(showEditEndPicker,()=>setShowEditEndPicker(false),editEndTime,setEditEndTime)}

                    <View style={styles.row}><Text style={styles.label}>Important:</Text>
                        <Switch value={editImportant} onValueChange={setEditImportant}/>
                    </View>
                    <View style={styles.actions}>
                        <Pressable onPress={saveEdit}><Text style={styles.link}>Save</Text></Pressable>
                        <Pressable onPress={cancelEditing}><Text style={[styles.link,{color:'#999'}]}>Cancel</Text></Pressable>
                    </View>
                </View>
            );
        }
        return (
            <View style={styles.taskCard}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <Text style={styles.taskTime}>{format(item.startTime,'hh:mm a')} - {format(item.endTime,'hh:mm a')}</Text>
                {item.important && <Text style={styles.important}>IMPORTANT</Text>}
                <View style={styles.actions}>
                    <Pressable onPress={() => startEditing(item)}><Text style={styles.link}>Edit</Text></Pressable>
                    <Pressable onPress={() => handleDelete(item.id)}><Text style={[styles.link,{color:'#ff3b30'}]}>Delete</Text></Pressable>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Add Task</Text>
            <Text style={styles.label}>Title:</Text>
            <TextInput style={styles.input} placeholder="Task Title" value={title} onChangeText={setTitle}/>

            <Text style={styles.label}>Start Time:</Text>
            <Pressable onPress={()=>setShowStartPicker(true)} style={styles.timeBox}>
                <Text>{format(startTime,'hh:mm a')}</Text>
            </Pressable>
            {renderTimePickerModal(showStartPicker,()=>setShowStartPicker(false),startTime,setStartTime)}

            <Text style={styles.label}>End Time:</Text>
            <Pressable onPress={()=>setShowEndPicker(true)} style={styles.timeBox}>
                <Text>{format(endTime,'hh:mm a')}</Text>
            </Pressable>
            {renderTimePickerModal(showEndPicker,()=>setShowEndPicker(false),endTime,setEndTime)}

            <View style={styles.row}>
                <Text style={styles.label}>Important:</Text>
                <Switch value={important} onValueChange={setImportant}/>
            </View>
            <Button title="Add Task" onPress={handleAddTask}/>

            <Text style={[styles.heading,{marginTop:24}]}>Your Plan</Text>
            <FlatList data={tasks} keyExtractor={item=>item.id} renderItem={renderItem}/>
        </View>
    );
}

const styles=StyleSheet.create({
    container:{flex:1,padding:16,backgroundColor:'#fff'},
    heading:{fontSize:22,fontWeight:'600',marginBottom:12},
    label:{fontSize:16,marginBottom:4},
    input:{borderWidth:1,borderColor:'#ccc',borderRadius:8,padding:10,marginBottom:12},
    timeBox:{borderWidth:1,borderColor:'#ccc',borderRadius:8,padding:12,marginBottom:12,backgroundColor:'#f9f9f9'},
    row:{flexDirection:'row',alignItems:'center',marginBottom:12,gap:8},
    taskCard:{backgroundColor:'#f2f2f2',padding:12,borderRadius:12,marginBottom:10},
    taskTitle:{fontSize:18,fontWeight:'500'},
    taskTime:{color:'#555',marginVertical:4},
    important:{color:'#ff3b30',fontWeight:'bold'},
    actions:{flexDirection:'row',marginTop:8,gap:20},
    link:{fontWeight:'600',color:'#007AFF'},
    modalBackdrop:{flex:1,justifyContent:'flex-end',backgroundColor:'rgba(0,0,0,0.3)'},
    modalContent:{backgroundColor:'#fff',padding:16,borderTopLeftRadius:12,borderTopRightRadius:12},
    picker:{width:'100%',height:180}
});
