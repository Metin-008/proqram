import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

type Task = {
  id: number;
  title: string;
  category: string;
  time: string;
  color: string;
  done: boolean;
};

const DAYS = [
  { day: 'B.e', date: '17' },
  { day: 'Ç.a', date: '18' },
  { day: 'Ç', date: '19' },
  { day: 'C.a', date: '20' },
  { day: 'C', date: '21' },
  { day: 'Ş', date: '22' },
  { day: 'B', date: '23' },
];

const INITIAL_TASKS: Task[] = [
  { id: 1, title: 'Mobil proqramlaşdırma', category: 'Dərs', time: '09:30', color: '#6859E8', done: true },
  { id: 2, title: 'DayFlow təqdimatı', category: 'Layihə', time: '12:00', color: '#FF9B63', done: false },
  { id: 3, title: '30 dəqiqə kitab oxu', category: 'Şəxsi', time: '18:30', color: '#42BFA3', done: false },
];

function AppContent() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [selectedDay, setSelectedDay] = useState(2);
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [tab, setTab] = useState('Bu gün');

  const doneCount = tasks.filter((task) => task.done).length;
  const progress = tasks.length ? doneCount / tasks.length : 0;
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 12 ? 'Sabahın xeyir' : hour < 18 ? 'Günortan xeyir' : 'Axşamın xeyir';
  }, []);

  const toggleTask = (id: number) => {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task));
  };

  const addTask = () => {
    const title = newTitle.trim();
    if (!title) return;
    setTasks((current) => [
      ...current,
      { id: Date.now(), title, category: 'Yeni tapşırıq', time: '14:00', color: '#6859E8', done: false },
    ]);
    setNewTitle('');
    setModalOpen(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>{greeting},</Text>
            <Text style={styles.name}>Aylin ✨</Text>
          </View>
          <Pressable style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
            <View style={styles.onlineDot} />
          </Pressable>
        </View>

        <View style={styles.titleRow}>
          <View>
            <Text style={styles.pageTitle}>Gününü axına burax.</Text>
            <Text style={styles.subtitle}>19 noyabr, cümə axşamı</Text>
          </View>
          <Pressable style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={21} color="#171725" />
            <View style={styles.notificationDot} />
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysRow}>
          {DAYS.map((item, index) => {
            const selected = selectedDay === index;
            return (
              <Pressable key={item.date} onPress={() => setSelectedDay(index)} style={[styles.dayCard, selected && styles.dayCardSelected]}>
                <Text style={[styles.dayName, selected && styles.dayTextSelected]}>{item.day}</Text>
                <Text style={[styles.dayDate, selected && styles.dayTextSelected]}>{item.date}</Text>
                {selected && <View style={styles.dayDot} />}
              </Pressable>
            );
          })}
        </ScrollView>

        <LinearGradient colors={['#7365F0', '#5242D4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.progressCard}>
          <View style={styles.progressTop}>
            <View>
              <Text style={styles.progressLabel}>GÜNÜN İRƏLİLƏYİŞİ</Text>
              <Text style={styles.progressTitle}>Əla başlanğıcdır!</Text>
            </View>
            <View style={styles.percentCircle}>
              <Text style={styles.percentText}>{Math.round(progress * 100)}%</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressNote}>{doneCount}/{tasks.length} tapşırıq tamamlandı · Davam et, bacaracaqsan!</Text>
          <View style={styles.bubbleOne} />
          <View style={styles.bubbleTwo} />
        </LinearGradient>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Bugünkü plan</Text>
            <Text style={styles.sectionHint}>{tasks.length} tapşırıq</Text>
          </View>
          <Pressable onPress={() => setModalOpen(true)} style={styles.addSmall}>
            <Ionicons name="add" size={18} color="#6859E8" />
            <Text style={styles.addSmallText}>Əlavə et</Text>
          </Pressable>
        </View>

        <View style={styles.taskList}>
          {tasks.map((task) => (
            <Pressable key={task.id} onPress={() => toggleTask(task.id)} style={styles.taskCard}>
              <View style={[styles.timeBar, { backgroundColor: task.color }]} />
              <View style={styles.taskTimeWrap}>
                <Text style={styles.taskTime}>{task.time}</Text>
                <View style={styles.timeLine} />
              </View>
              <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, task.done && styles.taskDone]} numberOfLines={1}>{task.title}</Text>
                <View style={styles.categoryRow}>
                  <View style={[styles.categoryDot, { backgroundColor: task.color }]} />
                  <Text style={styles.categoryText}>{task.category}</Text>
                </View>
              </View>
              <View style={[styles.check, task.done && { backgroundColor: task.color, borderColor: task.color }]}>
                {task.done && <Ionicons name="checkmark" size={16} color="#FFF" />}
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.quoteCard}>
          <View style={styles.quoteIcon}><Ionicons name="sparkles" size={18} color="#E28C3C" /></View>
          <View style={styles.quoteCopy}>
            <Text style={styles.quoteLabel}>GÜNÜN MOTİVASİYASI</Text>
            <Text style={styles.quoteText}>“Kiçik addımlar böyük dəyişikliklərin başlanğıcıdır.”</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        {[
          { label: 'Bu gün', icon: 'today' as const },
          { label: 'Təqvim', icon: 'calendar-outline' as const },
          { label: 'Fokus', icon: 'timer-outline' as const },
          { label: 'Profil', icon: 'person-outline' as const },
        ].map((item, index) => {
          const active = tab === item.label;
          if (index === 2) {
            return <View key={item.label} style={styles.navSpacer} />;
          }
          return (
            <Pressable key={item.label} onPress={() => setTab(item.label)} style={styles.navItem}>
              <Ionicons name={item.icon} size={22} color={active ? '#6859E8' : '#A4A4B2'} />
              <Text style={[styles.navText, active && styles.navTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
        <Pressable onPress={() => setModalOpen(true)} style={styles.fab}>
          <LinearGradient colors={['#7B6CF5', '#5948DE']} style={styles.fabGradient}>
            <Ionicons name="add" size={30} color="#FFF" />
          </LinearGradient>
        </Pressable>
      </View>

      <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setModalOpen(false)} />
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Yeni tapşırıq</Text>
            <Text style={styles.modalSubtitle}>Bu gün üçün yeni bir hədəf əlavə et.</Text>
            <TextInput
              autoFocus
              value={newTitle}
              onChangeText={setNewTitle}
              onSubmitEditing={addTask}
              placeholder="Məsələn: təqdimatı tamamla"
              placeholderTextColor="#A4A4B2"
              style={styles.input}
              returnKeyType="done"
            />
            <Pressable onPress={addTask} style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.88 }]}>
              <Text style={styles.saveButtonText}>Tapşırığı əlavə et</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

export default function App() {
  return <SafeAreaProvider><AppContent /></SafeAreaProvider>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F8FC' },
  content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 130 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { color: '#8A8998', fontSize: 13, fontWeight: '500' },
  name: { color: '#171725', fontSize: 19, fontWeight: '800', marginTop: 2 },
  avatar: { width: 45, height: 45, borderRadius: 16, backgroundColor: '#E9E5FF', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#6557DE', fontSize: 17, fontWeight: '800' },
  onlineDot: { position: 'absolute', right: -1, bottom: 2, width: 11, height: 11, borderRadius: 6, backgroundColor: '#48CFA9', borderWidth: 2, borderColor: '#F8F8FC' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 28 },
  pageTitle: { fontSize: 25, lineHeight: 31, fontWeight: '800', color: '#171725', letterSpacing: -0.6 },
  subtitle: { marginTop: 5, color: '#92919E', fontSize: 13 },
  notificationButton: { width: 40, height: 40, backgroundColor: '#FFF', borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowColor: '#23203B', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
  notificationDot: { position: 'absolute', right: 10, top: 9, width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF735C', borderWidth: 1, borderColor: '#FFF' },
  daysRow: { gap: 9, paddingVertical: 22 },
  dayCard: { width: 50, height: 72, borderRadius: 18, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F0EFF5' },
  dayCardSelected: { backgroundColor: '#171725', borderColor: '#171725', shadowColor: '#171725', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  dayName: { fontSize: 11, color: '#9C9BA8', fontWeight: '600' },
  dayDate: { fontSize: 18, color: '#343340', fontWeight: '800', marginTop: 5 },
  dayTextSelected: { color: '#FFF' },
  dayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#8B7EFA', marginTop: 4 },
  progressCard: { borderRadius: 26, padding: 20, overflow: 'hidden', shadowColor: '#5948DE', shadowOpacity: 0.25, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 6 },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { color: '#D9D4FF', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  progressTitle: { color: '#FFF', fontSize: 20, fontWeight: '800', marginTop: 6 },
  percentCircle: { width: 51, height: 51, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  percentText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  progressTrack: { height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.18)', marginTop: 19, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: '#FFF' },
  progressNote: { color: '#DCD8FF', fontSize: 11, marginTop: 11, fontWeight: '500' },
  bubbleOne: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.06)', right: -35, bottom: -55 },
  bubbleTwo: { position: 'absolute', width: 45, height: 45, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.05)', left: -20, top: -10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, marginBottom: 13 },
  sectionTitle: { color: '#171725', fontSize: 18, fontWeight: '800' },
  sectionHint: { color: '#A3A2AE', fontSize: 11, marginTop: 3 },
  addSmall: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, backgroundColor: '#EEEAFE' },
  addSmallText: { fontSize: 11, color: '#6859E8', fontWeight: '700' },
  taskList: { gap: 10 },
  taskCard: { minHeight: 78, borderRadius: 20, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', paddingRight: 15, overflow: 'hidden', borderWidth: 1, borderColor: '#F0EFF4' },
  timeBar: { width: 4, height: 44, borderRadius: 3, marginLeft: 0 },
  taskTimeWrap: { width: 72, alignItems: 'center' },
  taskTime: { fontSize: 13, color: '#31303C', fontWeight: '700' },
  timeLine: { width: 18, height: 2, borderRadius: 1, backgroundColor: '#E8E7ED', marginTop: 7 },
  taskInfo: { flex: 1, paddingRight: 8 },
  taskTitle: { color: '#22212D', fontSize: 14, fontWeight: '700' },
  taskDone: { textDecorationLine: 'line-through', color: '#9897A2' },
  categoryRow: { flexDirection: 'row', alignItems: 'center', marginTop: 7 },
  categoryDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  categoryText: { fontSize: 10, color: '#9A99A5', fontWeight: '500' },
  check: { width: 25, height: 25, borderRadius: 9, borderWidth: 1.5, borderColor: '#D8D7DF', alignItems: 'center', justifyContent: 'center' },
  quoteCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5E9', borderRadius: 20, padding: 16, marginTop: 18, borderWidth: 1, borderColor: '#FBE9D1' },
  quoteIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#FFE7C5', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  quoteCopy: { flex: 1 },
  quoteLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1, color: '#D5904E' },
  quoteText: { fontSize: 12, lineHeight: 17, fontWeight: '600', color: '#6D533C', marginTop: 4 },
  bottomNav: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 88, paddingBottom: 15, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EFEFF3', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', shadowColor: '#171725', shadowOpacity: 0.06, shadowRadius: 18, shadowOffset: { width: 0, height: -7 }, elevation: 8 },
  navItem: { width: 68, height: 58, alignItems: 'center', justifyContent: 'center', gap: 4 },
  navSpacer: { width: 68 },
  navText: { fontSize: 9, color: '#A4A4B2', fontWeight: '600' },
  navTextActive: { color: '#6859E8', fontWeight: '800' },
  fab: { position: 'absolute', left: '50%', marginLeft: -31, top: -21, width: 62, height: 62, borderRadius: 22, backgroundColor: '#FFF', padding: 5, shadowColor: '#5948DE', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 7 }, elevation: 8 },
  fabGradient: { flex: 1, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(23,23,37,0.42)' },
  modalCard: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 35 },
  modalHandle: { width: 38, height: 4, borderRadius: 2, backgroundColor: '#E2E1E8', alignSelf: 'center', marginBottom: 22 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#171725' },
  modalSubtitle: { marginTop: 5, color: '#92919E', fontSize: 13 },
  input: { height: 56, borderRadius: 17, backgroundColor: '#F5F4F9', marginTop: 20, paddingHorizontal: 16, fontSize: 14, color: '#171725', borderWidth: 1, borderColor: '#ECEAF2' },
  saveButton: { height: 55, borderRadius: 17, backgroundColor: '#6859E8', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 13 },
  saveButtonText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
});
