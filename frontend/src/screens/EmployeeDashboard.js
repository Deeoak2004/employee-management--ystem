import React, { useEffect, useState, useContext } from "react";
import { View, Text, ScrollView, StyleSheet, Alert } from "react-native";
import { TextInput, Button, Portal, Dialog, Paragraph } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTasks, updateTask } from "../services/api";
import { AuthContext } from "../context/AuthContext";

const EmployeeDashboard = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [token, setToken] = useState("");
  const [comments, setComments] = useState({});
  const [visible, setVisible] = useState(false); 

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
        assigned_to: task.assigned_to ? Number(task.assigned_to) : null
      }));
      setTasks(normalizedTasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const submitComment = async (task) => {
    try {
      if (!token) return;
      const commentText = comments[task.id] || "";
      const payload = { ...task, comment: commentText };
      await updateTask(task.id, payload, token);
      Alert.alert("Success", "Comment submitted");
      fetchTasks(token);
    } catch (err) {
      console.error("Error updating task:", err);
      Alert.alert("Error", "Failed to submit comment");
    }
  };

  const markComplete = async (task) => {
    try {
      if (!token) return;
      const payload = { ...task, status: "Completed" };
      await updateTask(task.id, payload, token);
      Alert.alert("Success", "Task marked as completed");
      fetchTasks(token);
    } catch (err) {
      console.error("Error updating task:", err);
      Alert.alert("Error", "Failed to mark task completed");
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
            <Text style={styles.title}>{task.title}</Text>
            <Text style={styles.status}>Status: {task.status}</Text>
            <Text style={styles.commentText}>Comment: {task.comment || "None"}</Text>

            <TextInput
              label="Add Comment"
              value={comments[task.id] || ""}
              onChangeText={text => setComments({ ...comments, [task.id]: text })}
              mode="outlined"
              style={styles.input}
            />

            <View style={styles.buttonRow}>
              <Button
                mode="contained"
                onPress={() => submitComment(task)}
                buttonColor="#4caf50"
                style={styles.button}
              >
                Submit Comment
              </Button>
              <Button
                mode="contained"
                onPress={() => markComplete(task)}
                buttonColor="#2196f3"
                style={styles.button}
              >
                Mark Complete
              </Button>
            </View>
          </View>
        ))
      )}

     



<Portal>
  <Dialog
    visible={visible}
    onDismiss={hideDialog}
    style={{
      width: "35%",         
      alignSelf: "center",  
      borderRadius: 15,     
      elevation: 5          
    }}
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
</ScrollView>
  );
}; 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  logoutButton: {
    height: 40,
    justifyContent: "center",
  },
  noTaskText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#888",
  },
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
  completedCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#4caf50",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  status: {
    fontSize: 14,
    marginBottom: 5,
    color: "#555",
  },
  commentText: {
    fontSize: 14,
    marginBottom: 10,
    color: "#777",
  },
  input: {
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    justifyContent: "center",
  },
});

export default EmployeeDashboard;
