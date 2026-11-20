import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { Alert, BackHandler, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

type Icon = ComponentProps<typeof Ionicons>['name'];
type Screen = 'today' | 'plan' | 'habits' | 'focus' | 'more' | 'stats' | 'settings';
type Task = { id: string; title: string; date: string; done: boolean };
type Habit = { id: string; title: string; days: string[] };
type Timer = { duration: number; remaining: number; endsAt: number | null };
type Data = { name: string; duration: number; tasks: Task[]; habits: Habit[]; sessions: Record<string, number>; timer: Timer | null };

const color = { bg: '#111219', panel: '#1C1E29', line: '#303345', ink: '#F6F4FD', muted: '#AFB2C7', mint: '#C4FAAF', lilac: '#D1BEFF' };
const storageKey = 'ritm-v1';
const initial: Data = { name: '', duration: 25, tasks: [], habits: [], sessions: {}, timer: null };
const tabs: { key: Screen; title: string; icon: Icon }[] = [
  { key: 'today', title: 'Bu gün', icon: 'sunny-outline' },
  { key: 'plan', title: 'Plan', icon: 'calendar-outline' },
  { key: 'habits', title: 'Vərdiş', icon: 'repeat-outline' },
  { key: 'focus', title: 'Fokus', icon: 'timer-outline' },
  { key: 'more', title: 'Digər', icon: 'grid-outline' },
];

function dateKey(date = new Date()) {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()].map(n => String(n).padStart(2, '0')).join('-');
}

function shift(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

const weekdays = ['Baz', 'B.e.', 'Ç.a.', 'Çər', 'C.a.', 'Cüm', 'Şən'];
const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];

function formatDate(date: Date) {
  return `${date.getDate()} ${months[date.getMonth()]}`;
}
const makeId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

function Button({ title, icon, onPress, active = false, label }: {
  title?: string; icon?: Icon; onPress: () => void; active?: boolean; label?: string;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label ?? title} onPress={onPress}
    style={({ pressed }) => [styles.button, active && styles.active, pressed && styles.pressed]}>
    {icon && <Ionicons name={icon} size={20} color={active ? color.bg : color.mint} />}
    {title && <Text style={[styles.buttonText, active && styles.activeText]}>{title}</Text>}
  </Pressable>;
}

function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function Entry({ label, button, onAdd }: { label: string; button: string; onAdd: (text: string) => void }) {
  const [text, setText] = useState('');
  function submit() {
    if (!text.trim()) return;
    onAdd(text.trim());
    setText('');
  }
  return <View style={styles.row}>
    <TextInput accessibilityLabel={label} placeholder={label} placeholderTextColor={color.muted}
      value={text} onChangeText={setText} onSubmitEditing={submit} maxLength={90} returnKeyType="done" style={[styles.input, styles.flex]} />
    <Button icon="add" label={button} onPress={submit} active />
  </View>;
}

function Ritm() {
  const [data, setData] = useState<Data>(initial);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [screen, setScreen] = useState<Screen>('today');
  const [day, setDay] = useState(new Date());
  const [now, setNow] = useState(Date.now());
  const [range, setRange] = useState(7);
  const [name, setName] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    let live = true;
    AsyncStorage.getItem(storageKey).then(value => {
      if (!live || !value) return;
      const saved: Data = JSON.parse(value);
      setData(saved);
      setName(saved.name);
    }).catch(() => { if (live) setStorageError(true); })
      .finally(() => { if (live) setReady(true); });
    return () => { live = false; };
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(storageKey, JSON.stringify(data)).catch(() => setStorageError(true));
  }, [data, ready]);

  const endsAt = data.timer?.endsAt;
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), endsAt ? 250 : 30000);
    return () => clearInterval(id);
  }, [endsAt]);

  useEffect(() => {
    if (!endsAt || now < endsAt) return;
    setData(previous => {
      if (previous.timer?.endsAt !== endsAt) return previous;
      const key = dateKey(new Date(endsAt));
      return {
        ...previous,
        timer: null,
        sessions: { ...previous.sessions, [key]: (previous.sessions[key] ?? 0) + previous.timer.duration },
      };
    });
    Alert.alert('Fokus sessiyası bitdi');
  }, [now, endsAt]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'today') return false;
      setScreen(screen === 'stats' || screen === 'settings' ? 'more' : 'today');
      return true;
    });
    return () => subscription.remove();
  }, [screen]);

  if (!ready) return <SafeAreaView style={styles.app}><Text style={styles.heading}>Ritm</Text></SafeAreaView>;

  const today = new Date(now);
  const todayKey = dateKey(today);
  const selectedDate = dateKey(day);
  const todayTasks = data.tasks.filter(task => task.date === todayKey);
  const todayDone = todayTasks.filter(task => task.done).length;
  const habitsDone = data.habits.filter(habit => habit.days.includes(todayKey)).length;
  const todayFocus = data.sessions[todayKey] ?? 0;
  const remaining = data.timer
    ? (endsAt ? Math.max(0, Math.ceil((endsAt - now) / 1000)) : data.timer.remaining)
    : data.duration * 60;
  const clock = [Math.floor(remaining / 60), remaining % 60].map(n => String(n).padStart(2, '0')).join(':');

  function start() {
    const time = Date.now();
    setNow(time);
    setData(previous => {
      const timer = previous.timer ?? { duration: previous.duration, remaining: previous.duration * 60, endsAt: null };
      return { ...previous, timer: { ...timer, endsAt: time + timer.remaining * 1000 } };
    });
  }

  function pause() {
    const time = Date.now();
    if (!endsAt || time >= endsAt) {
      setNow(time);
      return;
    }
    setData(previous => previous.timer && previous.timer.endsAt === endsAt
      ? { ...previous, timer: { ...previous.timer, remaining: Math.ceil((endsAt - time) / 1000), endsAt: null } }
      : previous);
  }

  function setDuration(duration: number) {
    setData(previous => ({ ...previous, duration }));
  }

  function taskRow(task: Task, removable = true) {
    return <View key={task.id} style={styles.item}>
      <Pressable accessibilityRole="checkbox" accessibilityLabel={task.title} accessibilityState={{ checked: task.done }} style={[styles.row, styles.flex]}
        onPress={() => setData(previous => ({ ...previous, tasks: previous.tasks.map(item => item.id === task.id ? { ...item, done: !item.done } : item) }))}>
        <Ionicons name={task.done ? 'checkmark-circle' : 'ellipse-outline'} color={color.mint} size={23} />
        <Text style={[styles.body, styles.flex, task.done && styles.strike]}>{task.title}</Text>
      </Pressable>
      {removable && <Button icon="trash-outline" label={task.title + ' tapşırığını sil'}
        onPress={() => setData(previous => ({ ...previous, tasks: previous.tasks.filter(item => item.id !== task.id) }))} />}
    </View>;
  }

  function heading(title: string, subtitle: string) {
    return <View><Text accessibilityRole="header" style={styles.heading}>{title}</Text><Text style={styles.muted}>{subtitle}</Text></View>;
  }

  function durationButtons() {
    return <View style={styles.row}>
      {[15, 25, 45].map(duration => <Button key={duration} title={duration + ' dəq.'} active={data.duration === duration} onPress={() => setDuration(duration)} />)}
    </View>;
  }

  const statsDays = Array.from({ length: range }, (_, index) => shift(today, index - range + 1));
  const statsKeys = new Set(statsDays.map(dateKey));
  const statsFocus = statsDays.reduce((sum, date) => sum + (data.sessions[dateKey(date)] ?? 0), 0);
  const statsHabits = data.habits.reduce((sum, habit) => sum + habit.days.filter(key => statsKeys.has(key)).length, 0);
  const statsTasks = data.tasks.filter(task => task.done && statsKeys.has(task.date)).length;
  const maxFocus = Math.max(1, ...statsDays.map(date => data.sessions[dateKey(date)] ?? 0));

  const content: Record<Screen, ReactNode> = {
    today: <>
      {heading(data.name ? 'Salam, ' + data.name : 'Bu gün', formatDate(today))}
      <LinearGradient colors={['#DCFBBF', '#A3E8C5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.spread}><Text style={styles.heroLabel}>Günün planı</Text><Ionicons name="sparkles" size={28} color="#243D31" /></View>
        <Text style={styles.heroNumber}>{todayDone} / {todayTasks.length}</Text>
        <Text style={styles.heroLabel}>tapşırıq tamamlandı</Text>
        <View style={styles.track}><View style={[styles.fill, { width: todayTasks.length ? `${todayDone / todayTasks.length * 100}%` : '0%' }]} /></View>
      </LinearGradient>
      <View style={styles.row}>
        <Pressable style={[styles.card, styles.flex]} accessibilityRole="button" accessibilityLabel="Vərdişlər" onPress={() => setScreen('habits')}>
          <Ionicons name="repeat" color={color.lilac} size={23} /><Text style={styles.metric}>{habitsDone}/{data.habits.length}</Text><Text style={styles.muted}>Vərdişlər</Text>
        </Pressable>
        <Pressable style={[styles.card, styles.flex]} accessibilityRole="button" accessibilityLabel="Fokus" onPress={() => setScreen('focus')}>
          <Ionicons name="flash" color={color.mint} size={23} /><Text style={styles.metric}>{todayFocus} dəq.</Text><Text style={styles.muted}>Fokus</Text>
        </Pressable>
      </View>
      <Card>
        <View style={styles.spread}><Text style={styles.section}>Tapşırıqlar</Text><Button icon="add" label="Bu günə tapşırıq əlavə et" onPress={() => { setDay(today); setScreen('plan'); }} /></View>
        {todayTasks.length ? todayTasks.map(task => taskRow(task, false)) : <Text style={styles.muted}>Bu gün üçün tapşırıq yoxdur.</Text>}
      </Card>
    </>,
    plan: <>
      {heading('Plan', 'Tarix seç və tapşırıqlarını əlavə et.')}
      <Card>
        <View style={styles.spread}>
          <Button icon="chevron-back" label="Əvvəlki gün" onPress={() => setDay(shift(day, -1))} />
          <Text style={styles.section}>{formatDate(day)}</Text>
          <Button icon="chevron-forward" label="Növbəti gün" onPress={() => setDay(shift(day, 1))} />
        </View>
        <Button title="Bu günə qayıt" onPress={() => setDay(today)} />
      </Card>
      <Entry label="Yeni tapşırıq" button="Tapşırıq əlavə et" onAdd={title => setData(previous => ({ ...previous, tasks: [...previous.tasks, { id: makeId(), title, date: selectedDate, done: false }] }))} />
      <Card>{data.tasks.some(task => task.date === selectedDate)
        ? data.tasks.filter(task => task.date === selectedDate).map(task => taskRow(task))
        : <Text style={styles.muted}>Bu tarix üçün tapşırıq yoxdur.</Text>}</Card>
    </>,
    habits: <>
      {heading('Vərdişlər', 'Bu gün etdiklərini işarələ.')}
      <Entry label="Yeni vərdiş" button="Vərdiş əlavə et" onAdd={title => setData(previous => ({ ...previous, habits: [...previous.habits, { id: makeId(), title, days: [] }] }))} />
      {data.habits.length ? data.habits.map(habit => <Card key={habit.id}>
        <View style={styles.spread}>
          <Text style={[styles.section, styles.flex]}>{habit.title}</Text>
          <Button icon="trash-outline" label={habit.title + ' vərdişini sil'} onPress={() => setData(previous => ({ ...previous, habits: previous.habits.filter(item => item.id !== habit.id) }))} />
        </View>
        <View style={styles.spread}>
          {Array.from({ length: 7 }, (_, index) => shift(today, index - 6)).map(date => {
            const checked = habit.days.includes(dateKey(date));
            return <View key={dateKey(date)} style={styles.habitDay}>
              <Ionicons name={checked ? 'checkmark-circle' : 'ellipse-outline'} color={checked ? color.mint : color.muted} size={18} />
              <Text style={styles.small}>{weekdays[date.getDay()]}</Text>
            </View>;
          })}
        </View>
        <Button title={habit.days.includes(todayKey) ? 'İşarəni götür' : 'Bu gün etdim'} active={!habit.days.includes(todayKey)}
          onPress={() => setData(previous => ({ ...previous, habits: previous.habits.map(item => item.id !== habit.id ? item : {
            ...item, days: item.days.includes(todayKey) ? item.days.filter(key => key !== todayKey) : [...item.days, todayKey],
          }) }))} />
      </Card>) : <Card><Text style={styles.muted}>İlk vərdişini əlavə et.</Text></Card>}
    </>,
    focus: <>
      {heading('Fokus', todayFocus + ' dəqiqə bu gün tamamlanıb')}
      <LinearGradient colors={['#30264A', '#1C1E29']} style={styles.timer}>
        <Ionicons name="timer-outline" color={color.lilac} size={30} />
        <Text style={styles.clock}>{clock}</Text>
        <View style={styles.row}>
          <Button title={endsAt ? 'Fasilə ver' : data.timer ? 'Davam et' : 'Başlat'} active onPress={endsAt ? pause : start} />
          {data.timer && <Button title="Sıfırla" onPress={() => setData(previous => ({ ...previous, timer: null }))} />}
        </View>
      </LinearGradient>
      {!data.timer && durationButtons()}
    </>,
    more: <>
      {heading('Digər', 'Nəticələrinə bax və tətbiqi özünə uyğunlaşdır.')}
      <Button title="Statistika" icon="bar-chart-outline" onPress={() => setScreen('stats')} />
      <Button title="Ayarlar" icon="settings-outline" onPress={() => { setName(data.name); setConfirmReset(false); setScreen('settings'); }} />
    </>,
    stats: <>
      <Button icon="arrow-back" title="Geri" onPress={() => setScreen('more')} />
      {heading('Statistika', 'Seçilmiş dövr üzrə nəticələrin')}
      <View style={styles.row}>{[7, 14].map(days => <Button key={days} title={days + ' gün'} active={days === range} onPress={() => setRange(days)} />)}</View>
      <Card>
        <Text style={styles.section}>Fokus · {statsFocus} dəq.</Text>
        <View accessibilityLabel={statsDays.map(date => `${formatDate(date)}: ${data.sessions[dateKey(date)] ?? 0} dəqiqə`).join(', ')}
          accessible style={styles.chart}>
          {statsDays.map(date => <View key={dateKey(date)} style={styles.chartColumn}>
            <View style={[styles.chartBar, { height: Math.max(4, (data.sessions[dateKey(date)] ?? 0) / maxFocus * 90) }]} />
            <Text style={styles.small}>{date.getDate()}</Text>
          </View>)}
        </View>
      </Card>
      <Card><Text style={styles.body}>{statsTasks} tamamlanan tapşırıq</Text><Text style={styles.body}>{statsHabits} vərdiş qeydi</Text></Card>
    </>,
    settings: <>
      <Button icon="arrow-back" title="Geri" onPress={() => setScreen('more')} />
      {heading('Ayarlar', 'Salamlama və fokus seçimləri')}
      <Card>
        <Text style={styles.section}>Adın</Text>
        <TextInput value={name} accessibilityLabel="Adın" onChangeText={setName} maxLength={36} style={styles.input} />
        <Button title="Adı saxla" active onPress={() => setData(previous => ({ ...previous, name: name.trim() }))} />
      </Card>
      <Card><Text style={styles.section}>Standart fokus vaxtı</Text>{durationButtons()}</Card>
      <Card>
        {confirmReset && <Text style={styles.body}>Tapşırıqlar, vərdişlər və fokus nəticələri silinəcək.</Text>}
        <Button title={confirmReset ? 'Silinməni təsdiqlə' : 'Məlumatları sil'} onPress={() => {
          if (!confirmReset) { setConfirmReset(true); return; }
          setData(initial);
          setName('');
          setConfirmReset(false);
        }} />
        {confirmReset && <Button title="Ləğv et" onPress={() => setConfirmReset(false)} />}
      </Card>
    </>,
  };

  const activeTab = screen === 'stats' || screen === 'settings' ? 'more' : screen;
  return <SafeAreaView style={styles.app}>
    <StatusBar style="light" />
    <View style={styles.frame}>
      <View style={styles.brand}><Ionicons name="pulse" size={25} color={color.mint} /><Text style={styles.brandText}>ritm</Text></View>
      {storageError && <Text accessibilityRole="alert" style={styles.muted}>Cihaz yaddaşına girişdə xəta oldu.</Text>}
      <ScrollView key={screen} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>{content[screen]}</ScrollView>
      <View style={styles.nav}>
        {tabs.map(tab => <Pressable key={tab.key} accessibilityRole="tab" accessibilityLabel={tab.title} accessibilityState={{ selected: activeTab === tab.key }}
          onPress={() => setScreen(tab.key)} style={styles.tab}>
          <View style={[styles.tabIcon, activeTab === tab.key && styles.tabActive]}><Ionicons name={tab.icon} size={21} color={activeTab === tab.key ? color.mint : color.muted} /></View>
          <Text style={[styles.small, activeTab === tab.key && styles.mint]}>{tab.title}</Text>
        </Pressable>)}
      </View>
    </View>
  </SafeAreaView>;
}

export default function App() {
  return <SafeAreaProvider><Ritm /></SafeAreaProvider>;
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: color.bg },
  frame: { flex: 1, width: '100%', maxWidth: 540, alignSelf: 'center' },
  brand: { flexDirection: 'row', gap: 7, alignItems: 'center', paddingHorizontal: 21, paddingTop: 12, paddingBottom: 8 },
  brandText: { color: color.ink, fontSize: 23, fontWeight: '800', letterSpacing: 1 },
  content: { padding: 20, gap: 16, paddingBottom: 28 },
  heading: { color: color.ink, fontSize: 40, fontWeight: '800', letterSpacing: -1.4 },
  section: { color: color.ink, fontSize: 19, fontWeight: '700' },
  body: { color: color.ink, fontSize: 16 },
  muted: { color: color.muted, fontSize: 14 },
  small: { color: color.muted, fontSize: 11 },
  mint: { color: color.mint },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 9, flexWrap: 'wrap' },
  spread: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  card: { backgroundColor: color.panel, borderColor: color.line, borderWidth: 1, borderRadius: 22, padding: 15, gap: 12 },
  hero: { borderRadius: 25, padding: 21 },
  heroLabel: { color: '#243D31', fontSize: 15, fontWeight: '700' },
  heroNumber: { color: '#172F24', fontSize: 51, fontWeight: '900', letterSpacing: -2 },
  track: { height: 7, overflow: 'hidden', backgroundColor: '#90C99F', borderRadius: 5, marginTop: 15 },
  fill: { height: '100%', backgroundColor: '#285942' },
  metric: { color: color.ink, fontSize: 24, fontWeight: '800' },
  button: { minHeight: 44, minWidth: 44, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7, borderRadius: 13, backgroundColor: '#292C3C' },
  pressed: { opacity: 0.7 },
  active: { backgroundColor: color.mint },
  buttonText: { color: color.ink, fontSize: 14, fontWeight: '700', flexShrink: 1 },
  activeText: { color: color.bg },
  input: { minHeight: 45, minWidth: 100, borderRadius: 13, padding: 11, fontSize: 16, borderWidth: 1, borderColor: color.line, backgroundColor: color.panel, color: color.ink },
  item: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44 },
  strike: { textDecorationLine: 'line-through', color: color.muted },
  habitDay: { alignItems: 'center', gap: 5, flex: 1 },
  timer: { borderRadius: 26, alignItems: 'center', paddingVertical: 39, paddingHorizontal: 12, gap: 16 },
  clock: { color: color.ink, fontSize: 64, fontVariant: ['tabular-nums'], fontWeight: '800' },
  chart: { flexDirection: 'row', alignItems: 'flex-end', minHeight: 108, gap: 4 },
  chartColumn: { flex: 1, alignItems: 'center', gap: 5 },
  chartBar: { width: '70%', borderRadius: 5, backgroundColor: color.lilac },
  nav: { flexDirection: 'row', backgroundColor: color.panel, borderTopColor: color.line, borderTopWidth: 1, paddingVertical: 7 },
  tab: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', gap: 3 },
  tabIcon: { borderRadius: 15, paddingVertical: 4, paddingHorizontal: 14 },
  tabActive: { backgroundColor: '#323D39' },
});
