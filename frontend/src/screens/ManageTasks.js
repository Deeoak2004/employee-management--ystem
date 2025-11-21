import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  TextInput,
  Button,
  Text,
  Card,
  Snackbar,
  Appbar,
  Modal,
  Portal,
  Provider,
  Menu,
} from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTasks, createTask, updateTask, deleteTask } from "../services/api";

const ManageTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "",
    assigned_to: null,
    comment: "",
  });
  const [editingTask, setEditingTask] = useState(null);
  const [token, setToken] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const fetchTokenAndData = async () => {
      const t = await AsyncStorage.getItem("token");
      if (!t) return;
      setToken(t);

      try {
        const storedUsers = await AsyncStorage.getItem("USERS");
        const localUsers = storedUsers ? JSON.parse(storedUsers) : [];
        setUsers(localUsers);

        const tasksRes = await getTasks(t);
        const tasksArray = Array.isArray(tasksRes.data) ? tasksRes.data : [];
        setTasks(tasksArray);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchTokenAndData();
  }, []);

  const getUserName = (id) => {
    const u = users.find((user) => user.id === id);
    return u ? u.name : "Unassigned";
  };

  const openTaskModal = (task = null) => {
    setEditingTask(task);

    AsyncStorage.getItem("USERS").then((storedUsers) => {
      const localUsers = storedUsers ? JSON.parse(storedUsers) : [];
      setUsers(localUsers);
    });

    if (task) {
      setForm({
        title: task.title,
        description: task.description,
        status: task.status,
        assigned_to: task.assigned_to,
        comment: task.comment,
      });
    } else {
      setForm({ title: "", description: "", status: "", assigned_to: null, comment: "" });
    }

    setVisible(true);
  };

  const saveTask = async () => {
    try {
      if (!token) return;
      if (!form.assigned_to) {
        setSnackbarMessage("Assigned To is required ❌");
        setSnackbarVisible(true);
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

      const tasksRes = await getTasks(token);
      const tasksArray = Array.isArray(tasksRes.data) ? tasksRes.data : [];
      setTasks(tasksArray);

      setVisible(false);
      setForm({ title: "", description: "", status: "", assigned_to: null, comment: "" });
      setEditingTask(null);
    } catch (err) {
      console.error("Error saving task:", err.response?.data || err.message);
      setSnackbarMessage("Failed to save task ❌");
      setSnackbarVisible(true);
    }
  };

  const openDeleteConfirm = (task) => {
    setSelectedTask(task);
    setConfirmVisible(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteTask(selectedTask.id, token);
      setTasks((prev) => prev.filter((t) => t.id !== selectedTask.id));
      setSnackbarMessage("Task deleted successfully ✅");
      setSnackbarVisible(true);
    } catch (err) {
      console.error("Delete error:", err);
      setSnackbarMessage("Failed to delete task ❌");
      setSnackbarVisible(true);
    }
    setConfirmVisible(false);
  };

  return (
    <Provider>
      <Appbar.Header style={{ backgroundColor: "#f6f6f6" }}>
        <Appbar.Content title="" />
        <Button
          mode="contained"
          compact
          style={styles.smallButton}
          onPress={() => openTaskModal(null)}
        >
          Create Task
        </Button>
      </Appbar.Header>

      <ScrollView style={styles.container}>
        <Text style={styles.subheading}>All Tasks:</Text>

        {tasks.length === 0 ? (
          <Text style={styles.noTask}>No tasks available</Text>
        ) : (
          tasks.map((task) => (
            <Card
              key={task.id}
              style={[styles.taskCard, task.status === "Completed" && styles.completedCard]}
            >
              <Card.Content>
                <View style={styles.taskRow}>
                  <View style={styles.taskInfo}>
                    <Text style={styles.title}>Title: {task.title}</Text>
                    <Text>Description: {task.description || "None"}</Text>
                    <Text>Status: {task.status}</Text>
                    <Text>Assigned To: {getUserName(task.assigned_to)}</Text>
                    <Text>Comment: {task.comment || "None"}</Text>
                  </View>

                  <View style={styles.taskActions}>
                    <Button
                      mode="outlined"
                      onPress={() => openTaskModal(task)}
                      style={styles.editButton}
                    >
                      Edit
                    </Button>

                    <Button
                      mode="contained"
                      buttonColor="#f44336"
                      onPress={() => openDeleteConfirm(task)}
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

      {/* CREATE / EDIT MODAL */}
      <Portal>
        <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.modalBox}>
          <Card>
            <Card.Content>
              <Text style={styles.heading}>{editingTask ? "Edit Task" : "Create Task"}</Text>

              <TextInput
                label="Title"
                value={form.title}
                onChangeText={(text) => setForm({ ...form, title: text })}
                style={styles.input}
              />
              <TextInput
                label="Description"
                value={form.description}
                onChangeText={(text) => setForm({ ...form, description: text })}
                style={styles.input}
              />
              <TextInput
                label="Status"
                value={form.status}
                onChangeText={(text) => setForm({ ...form, status: text })}
                style={styles.input}
              />

              {/* Assigned To dropdown - only Employees */}
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setMenuVisible(true)}
                    style={{ marginBottom: 10 }}
                  >
                    {form.assigned_to ? getUserName(form.assigned_to) : "Select Assigned User"}
                  </Button>
                }
              >
                {users
                  .filter((user) => user.role === "Employee") // 👈 Filter only Employees
                  .map((user) => (
                    <Menu.Item
                      key={user.id}
                      title={user.name}
                      onPress={() => {
                        setForm({ ...form, assigned_to: user.id });
                        setMenuVisible(false);
                      }}
                    />
                  ))}
              </Menu>

              <TextInput
                label="Comment"
                value={form.comment}
                onChangeText={(text) => setForm({ ...form, comment: text })}
                style={styles.input}
              />

              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Button mode="contained" onPress={saveTask} style={{ flex: 1, marginRight: 8 }}>
                  {editingTask ? "Update Task" : "Create Task"}
                </Button>
                <Button mode="outlined" onPress={() => setVisible(false)} style={{ flex: 1 }}>
                  Cancel
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>

      {/* DELETE CONFIRM MODAL */}
      <Portal>
        <Modal visible={confirmVisible} onDismiss={() => setConfirmVisible(false)} contentContainerStyle={styles.confirmModal}>
          <Card>
            <Card.Content>
              <Text style={styles.confirmText}>Are you sure you want to delete this task?</Text>
              <View style={styles.confirmRow}>
                <Button mode="contained" buttonColor="#f44336" onPress={confirmDelete} style={styles.confirmButton}>
                  YES
                </Button>
                <Button mode="outlined" onPress={() => setConfirmVisible(false)} style={styles.confirmButton}>
                  NO
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{ label: "OK", onPress: () => setSnackbarVisible(false) }}
      >
        {snackbarMessage}
      </Snackbar>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: "#f5f5f5", flex: 1 },
  heading: { fontSize: 20, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  subheading: { fontSize: 18, fontWeight: "bold", marginTop: 10, marginBottom: 10 },
  smallButton: { marginRight: 10, borderRadius: 8, height: 35, justifyContent: "center" },
  taskCard: { marginVertical: 5, borderRadius: 12, backgroundColor: "#fff", elevation: 2, padding: 10 },
  completedCard: { borderLeftWidth: 5, borderLeftColor: "#4caf50" },
  input: { marginBottom: 10, backgroundColor: "#fff" },
  taskRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  taskInfo: { flex: 1 },
  taskActions: { justifyContent: "center", alignItems: "flex-end" },
  editButton: { marginBottom: 8, width: 100 },
  deleteButton: { width: 100 },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 5, color: "#333" },
  noTask: { textAlign: "center", marginTop: 20, fontStyle: "italic", color: "#888" },
  modalBox: { backgroundColor: "white", padding: 20, marginHorizontal: "30%", borderRadius: 12, elevation: 5, width: "40%", alignSelf: "center" },
  confirmModal: { backgroundColor: "white", padding: 18, marginHorizontal: 40, borderRadius: 12, elevation: 5, width: "25%", alignSelf: "center" },
  confirmText: { fontSize: 16, marginBottom: 12, textAlign: "center" },
  confirmRow: { flexDirection: "row", justifyContent: "space-between" },
  confirmButton: { marginHorizontal: 6, minWidth: 90 },
});

export default ManageTasks;
