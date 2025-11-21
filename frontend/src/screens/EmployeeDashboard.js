import React, { useEffect, useState, useContext } from "react";
import { View, Text, ScrollView, StyleSheet, Alert } from "react-native";
import { TextInput, Button, Portal, Dialog, Paragraph, Menu, Snackbar } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTasks, updateTask } from "../services/api";
import { AuthContext } from "../context/AuthContext";

const EmployeeDashboard = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [token, setToken] = useState("");
  const [comments, setComments] = useState({});
  const [visible, setVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState({});
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const { logout } = useContext(AuthContext);

  useEffect(() => {
    const fetchTokenAndTasks = async () => {
      const t = await AsyncStorage.getItem("token");
      setToken(t);
      fetchTasks(t);
    };
    fetchTokenAndTasks();
  }, []);

  const fetchTasks = async (t) => {
    try {
      const res = await getTasks(t);
      const tasksData = Array.isArray(res.data) ? res.data : [];
      const normalizedTasks = tasksData.map(task => ({
        ...task,
        assigned_to: task.assigned_to ? Number(task.assigned_to) : null,
        locked: task.status === "Completed"
      }));
      setTasks(normalizedTasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const submitTask = async (task) => {
    try {
      if (!token) return;
      const payload = { ...task, comment: comments[task.id] || "" };
      await updateTask(task.id, payload, token);

      // Show success Snackbar if completed
      if (task.status === "Completed") {
        setSnackbarMessage("Your task has been completed successfully ✅");
        setSnackbarVisible(true);
        setTasks(prev =>
          prev.map(t => t.id === task.id ? { ...t, locked: true } : t)
        );
      }

      fetchTasks(token);
    } catch (err) {
      console.error("Error updating task:", err);
      Alert.alert("Error", "Failed to update task ❌");
    }
  };

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const confirmLogout = async () => {
    hideDialog();
    await AsyncStorage.removeItem("token");
    logout();
    navigation.replace("Login");
  };

  const statusOptions = ["Pending", "In-Process", "Completed"];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>My Tasks</Text>
        <Button
          mode="contained"
          onPress={showDialog} 
          style={styles.logoutButton}
          buttonColor="#f44336"
        >
          Logout
        </Button>
      </View>

      {tasks.length === 0 ? (
        <Text style={styles.noTaskText}>No tasks assigned yet</Text>
      ) : (
        tasks.map(task => (
          <View key={task.id} style={[styles.taskCard, task.status === "Completed" && styles.completedCard]}>
            <Text style={styles.title}>Title: {task.title}</Text>
            <Text style={styles.description}>Description: {task.description || "None"}</Text>
            <Text style={styles.commentText}>Comment: {task.comment || "None"}</Text>

            {/* Status Dropdown left-aligned and normal size */}
            <View style={{ marginBottom: 10, alignItems: "flex-start" }}>
              <Menu
                visible={menuVisible[task.id] || false}
                onDismiss={() => setMenuVisible(prev => ({ ...prev, [task.id]: false }))}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => {
                      if (!task.locked) setMenuVisible(prev => ({ ...prev, [task.id]: true }));
                    }}
                    disabled={task.locked}
                    style={{ width: 150, justifyContent: "center" }}
                    contentStyle={{ height: 40 }}
                  >
                    Status: {task.status}
                  </Button>
                }
              >
                {statusOptions.map(opt => (
                  <Menu.Item
                    key={opt}
                    title={opt}
                    onPress={() => {
                      setTasks(prev =>
                        prev.map(t => t.id === task.id ? { ...t, status: opt } : t)
                      );
                      setMenuVisible(prev => ({ ...prev, [task.id]: false }));
                    }}
                  />
                ))}
              </Menu>
            </View>

            <TextInput
              label="Add Comment"
              value={comments[task.id] || ""}
              onChangeText={text => setComments({ ...comments, [task.id]: text })}
              mode="outlined"
              style={styles.input}
            />

            {/* Submit button right-aligned */}
            <View style={styles.buttonRow}>
              <Button
                mode="contained"
                onPress={() => submitTask(task)}
                style={styles.submitButton}
              >
                Submit
              </Button>
            </View>
          </View>
        ))
      )}

      {/* Logout Dialog */}
      <Portal>
        <Dialog
          visible={visible}
          onDismiss={hideDialog}
          style={styles.dialog}
        >
          <Dialog.Title style={{ fontSize: 20, textAlign: "center" }}>Logout</Dialog.Title>
          <Dialog.Content>
            <Paragraph style={{ fontSize: 16, textAlign: "center" }}>
              Are you sure you want to logout?
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions style={{ justifyContent: "space-around" }}>
            <Button onPress={hideDialog}>Cancel</Button>
            <Button onPress={confirmLogout}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Snackbar for Completed Tasks */}
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f5f5f5" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  heading: { fontSize: 24, fontWeight: "bold", color: "#333" },
  logoutButton: { height: 40, justifyContent: "center" },
  noTaskText: { textAlign: "center", marginTop: 50, fontSize: 16, color: "#888" },
  taskCard: {
    backgroundColor: "#fff",
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  completedCard: { borderLeftWidth: 5, borderLeftColor: "#4caf50" },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 5, color: "#333" },
  description: { fontSize: 14, marginBottom: 5, color: "#555" },
  commentText: { fontSize: 14, marginBottom: 10, color: "#777" },
  input: { marginBottom: 10, backgroundColor: "#fff" },
  buttonRow: { flexDirection: "row", justifyContent: "flex-end" },
  submitButton: { width: 100, justifyContent: "center" },
  dialog: { width: "35%", alignSelf: "center", borderRadius: 15, elevation: 5 }
});

export default EmployeeDashboard;
