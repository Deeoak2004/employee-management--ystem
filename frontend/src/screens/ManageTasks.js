import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Alert, View } from "react-native";
import { TextInput, Button, Text, Card, Snackbar } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTasks, createTask, updateTask, deleteTask, getUsers } from "../services/api";

const ManageTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", status: "", assigned_to: null, comment: "" });
  const [editingTask, setEditingTask] = useState(null);
  const [token, setToken] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    const fetchTokenAndData = async () => {
      const t = await AsyncStorage.getItem("token");
      if (!t) return;
      setToken(t);

      try {
        const usersRes = await getUsers(t);
        const normalizedUsers = (usersRes.data || []).map(u => ({ ...u, id: Number(u.id) }));
        setUsers(normalizedUsers);

        const tasksRes = await getTasks(t);
        const tasksArray = Array.isArray(tasksRes.data) ? tasksRes.data : [];
        const normalizedTasks = tasksArray.map(task => ({
          ...task,
          assigned_to: task.assigned_to ? Number(task.assigned_to) : null
        }));
        setTasks(normalizedTasks);
      } catch (err) {
        console.error("Error fetching data:", err);
        Alert.alert("Error", "Failed to fetch data");
      }
    };
    fetchTokenAndData();
  }, []);

  useEffect(() => {
    if (editingTask) {
      setForm({
        title: editingTask.title,
        description: editingTask.description,
        status: editingTask.status,
        assigned_to: editingTask.assigned_to,
        comment: editingTask.comment
      });
    }
  }, [editingTask]);

  const saveTask = async () => {
    try {
      if (!token) return;
      if (!form.assigned_to) {
        Alert.alert("Validation Error", "Assigned To is required");
        return;
      }

      const payload = { ...form, assigned_to: Number(form.assigned_to) };

      if (editingTask) {
        await updateTask(editingTask.id, payload, token);
        setSnackbarMessage("Task updated successfully ✅");
      } else {
        await createTask(payload, token);
        setSnackbarMessage("Task created successfully ✅");
      }

      setSnackbarVisible(true);
      setForm({ title: "", description: "", status: "", assigned_to: null, comment: "" });
      setEditingTask(null);

      // Refresh tasks
      const tasksRes = await getTasks(token);
      const tasksArray = Array.isArray(tasksRes.data) ? tasksRes.data : [];
      const normalizedTasks = tasksArray.map(task => ({
        ...task,
        assigned_to: task.assigned_to ? Number(task.assigned_to) : null
      }));
      setTasks(normalizedTasks);

    } catch (err) {
      console.error("Error saving task:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to save task");
    }
  };

  const handleDeleteTask = async (task) => {
    try {
      await deleteTask(task.id, token);
      setTasks(prev => prev.filter(t => t.id !== task.id));
      setSnackbarMessage("Task deleted successfully ✅");
      setSnackbarVisible(true);
    } catch (err) {
      console.error("Delete error:", err);
      Alert.alert("Error", "Failed to delete task");
    }
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <Text style={styles.heading}>Manage Tasks</Text>

        {/* Task Form */}
        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="Title"
              value={form.title}
              onChangeText={text => setForm({ ...form, title: text })}
              style={styles.input}
            />
            <TextInput
              label="Description"
              value={form.description}
              onChangeText={text => setForm({ ...form, description: text })}
              style={styles.input}
            />
            <TextInput
              label="Status"
              value={form.status}
              onChangeText={text => setForm({ ...form, status: text })}
              style={styles.input}
            />
            <TextInput
              label="Assigned To (User ID)"
              value={form.assigned_to ? form.assigned_to.toString() : ""}
              onChangeText={text => setForm({ ...form, assigned_to: text ? Number(text) : null })}
              style={styles.input}
            />
            <TextInput
              label="Comment"
              value={form.comment}
              onChangeText={text => setForm({ ...form, comment: text })}
              style={styles.input}
            />

            <Button mode="contained" onPress={saveTask} style={styles.button}>
              {editingTask ? "Update Task" : "Create Task"}
            </Button>
          </Card.Content>
        </Card>

        <Text style={styles.subheading}>All Tasks:</Text>

        {tasks.length === 0 ? (
          <Text style={styles.noTask}>No tasks available</Text>
        ) : (
          tasks.map(task => (
            <Card
              key={task.id}
              style={[styles.taskCard, task.status === "Completed" && styles.completedCard]}
            >
              <Card.Content>
                <View style={styles.taskRow}>
                  {/* Left side text */}
                  <View style={styles.taskInfo}>
                    <Text style={styles.title}>{task.title}</Text>
                    <Text style={styles.status}>Status: {task.status}</Text>
                    <Text>Assigned To: {task.assigned_to || "Unassigned"}</Text>
                    <Text>Comment: {task.comment || "None"}</Text>
                  </View>

                  {/* Right side buttons */}
                  <View style={styles.taskActions}>
                    <Button
                      mode="outlined"
                      onPress={() => setEditingTask(task)}
                      style={styles.editButton}
                    >
                      Edit
                    </Button>

                    <Button
                      mode="contained"
                      buttonColor="#f44336"
                      onPress={() => handleDeleteTask(task)}
                      style={styles.deleteButton}
                    >
                      Delete
                    </Button>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: "OK",
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </>
  );
};

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: "#f5f5f5", flex: 1 },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 10, color: "#333" },
  subheading: { fontSize: 20, fontWeight: "bold", marginTop: 20, marginBottom: 10 },
  card: { marginVertical: 10, padding: 10, borderRadius: 12, backgroundColor: "#fff", elevation: 3 },
  taskCard: { marginVertical: 5, borderRadius: 12, backgroundColor: "#fff", elevation: 2, padding: 10 },
  completedCard: { borderLeftWidth: 5, borderLeftColor: "#4caf50" },
  input: { marginBottom: 10, backgroundColor: "#fff" },
  button: { marginTop: 10, justifyContent: "center" },
  taskRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  taskInfo: { flex: 1 },
  taskActions: { justifyContent: "center", alignItems: "flex-end" },
  editButton: { marginBottom: 8, width: 100 },
  deleteButton: { width: 100 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 5, color: "#333" },
  status: { fontSize: 14, marginBottom: 5, color: "#555" },
  noTask: { textAlign: "center", marginTop: 20, fontStyle: "italic", color: "#888" }
});

export default ManageTasks;
