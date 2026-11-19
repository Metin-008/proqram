
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Task = {
  id: number;
  title: string;
  category: string;
  completed: boolean;
};

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Learn React Native', category: 'Study', completed: false },
    { id: 2, title: 'Read a book', category: 'Personal', completed: true },
    { id: 3, title: 'Practice JavaScript', category: 'Study', completed: false },
    { id: 4, title: 'Complete my project', category: 'Work', completed: false },
  ]);

  const [newTask, setNewTask] = useState('');

  const completedTasks = tasks.filter(task => task.completed).length;

  const progress = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;

  const addTask = () => {
    if (!newTask.trim()) return;

    setTasks([
      ...tasks,
      {
        id: Date.now(),
        title: newTask.trim(),
        category: 'Personal',
        completed: false,
      },
    ]);

    setNewTask('');
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task =>
      task.id === id
        ? { ...task, completed: !task.completed }
        : task
    ));
  };

  const today = new Date();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F7FC" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>DayFlow.</Text>
            <Text style={styles.subtitle}>Let's organize your day.</Text>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>D</Text>
          </View>
        </View>

        <View style={styles.welcome}>
          <Text style={styles.greeting}>Good day! 👋</Text>
          <Text style={styles.date}>
            {today.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressLabel}>DAILY PROGRESS</Text>
              <Text style={styles.progressNumber}>
                {completedTasks} / {tasks.length} Tasks
              </Text>
            </View>

            <Text style={styles.percentage}>{progress}%</Text>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[styles.progressFill, { width: `${progress}%` }]}
            />
          </View>

          <Text style={styles.progressMessage}>
            {progress === 100
              ? 'Amazing! All tasks completed 🎉'
              : 'Keep going! You are doing great.'}
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Tasks</Text>
          <Text style={styles.taskCount}>{tasks.length} tasks</Text>
        </View>

        <View style={styles.taskList}>
          {tasks.map(task => (
            <Pressable
              key={task.id}
              style={styles.taskCard}
              onPress={() => toggleTask(task.id)}
            >
              <View style={[
                styles.checkbox,
                task.completed && styles.checkboxCompleted,
              ]}>
                {task.completed && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>

              <View style={styles.taskInfo}>
                <Text style={[
                  styles.taskTitle,
                  task.completed && styles.taskDone,
                ]}>
                  {task.title}
                </Text>
                <Text style={styles.taskCategory}>
                  {task.category}
                </Text>
              </View>

              <Text style={styles.taskArrow}>›</Text>
            </Pressable>
          ))}

          {tasks.length === 0 && (
            <Text style={styles.emptyText}>
              No tasks yet. Add your first task!
            </Text>
          )}
        </View>

        <View style={styles.addSection}>
          <Text style={styles.sectionTitle}>Add New Task</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Write a new task..."
              placeholderTextColor="#9999A8"
              value={newTask}
              onChangeText={setNewTask}
              onSubmitEditing={addTask}
              returnKeyType="done"
            />

            <Pressable style={styles.addButton} onPress={addTask}>
              <Text style={styles.addButtonText}>+</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.footer}>Made with DayFlow ✨</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FC',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 15,
  },

  logo: {
    fontSize: 27,
    fontWeight: '800',
    color: '#6558D3',
  },

  subtitle: {
    fontSize: 13,
    color: '#9292A2',
    marginTop: 4,
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#E8E5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6558D3',
  },

  welcome: {
    paddingHorizontal: 24,
    marginTop: 35,
    marginBottom: 22,
  },

  greeting: {
    fontSize: 25,
    fontWeight: '800',
    color: '#24243A',
  },

  date: {
    fontSize: 14,
    color: '#9292A2',
    marginTop: 7,
  },

  progressCard: {
    marginHorizontal: 20,
    padding: 22,
    borderRadius: 22,
    backgroundColor: '#6558D3',
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  progressLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DAD6FF',
    letterSpacing: 1,
  },

  progressNumber: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },

  percentage: {
    fontSize: 27,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  progressBackground: {
    height: 8,
    backgroundColor: '#9189E6',
    borderRadius: 10,
    marginTop: 22,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },

  progressMessage: {
    fontSize: 12,
    color: '#E2DFFF',
    marginTop: 13,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 32,
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#24243A',
  },

  taskCount: {
    color: '#9292A2',
    fontSize: 13,
  },

  taskList: {
    paddingHorizontal: 20,
    gap: 11,
  },

  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  checkbox: {
    width: 23,
    height: 23,
    borderWidth: 2,
    borderColor: '#DAD9E5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkboxCompleted: {
    backgroundColor: '#6558D3',
    borderColor: '#6558D3',
  },

  checkmark: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  taskInfo: {
    flex: 1,
    marginLeft: 13,
  },

  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333347',
  },

  taskDone: {
    textDecorationLine: 'line-through',
    color: '#A5A5B1',
  },

  taskCategory: {
    fontSize: 11,
    color: '#9999A8',
    marginTop: 5,
  },

  taskArrow: {
    fontSize: 25,
    color: '#B5B3C4',
  },

  emptyText: {
    textAlign: 'center',
    color: '#9292A2',
    padding: 20,
  },

  addSection: {
    marginHorizontal: 20,
    marginTop: 30,
  },

  inputContainer: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },

  input: {
    flex: 1,
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    color: '#333347',
    fontSize: 14,
  },

  addButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#6558D3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addButtonText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '400',
  },

  footer: {
    textAlign: 'center',
    color: '#A5A5B1',
    fontSize: 12,
    marginTop: 35,
    marginBottom: 25,
  },
});
