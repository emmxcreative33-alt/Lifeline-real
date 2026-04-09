/**
 * VitalSync – Dashboard Screen
 * Production-ready React Native component
 * Architecture: Functional components + Hooks + Animated API
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  Easing,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  Vibration,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Stop,
  Polyline,
} from 'react-native-svg';

// ─── Design Tokens ────────────────────────────────────────────────────────────

const COLORS = {
  primary: '#1A56DB',
  accent: '#00C48C',
  warn: '#F59E0B',
  danger: '#EF4444',
  purple: '#7C3AED',
  sky: '#0EA5E9',
  background: '#F7F8FC',
  card: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  border: 'rgba(15,23,42,0.08)',
  scoreGradientA: '#1A56DB',
  scoreGradientB: '#00C48C',
};

const DARK = {
  background: '#0F1520',
  card: '#1A2236',
  text: '#F1F5F9',
  muted: '#8896AB',
  border: 'rgba(255,255,255,0.07)',
};

const FONT = {
  hero: { fontSize: 36, fontWeight: '500' as const, letterSpacing: -0.8 },
  title: { fontSize: 22, fontWeight: '500' as const, letterSpacing: -0.3 },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
};

const RADIUS = { card: 16, sm: 10 };
const SPACING = { xs: 8, sm: 12, md: 16, lg: 24, xl: 32 };

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Data Layer ───────────────────────────────────────────────────────────────

interface StatData {
  id: string;
  label: string;
  value: number;
  unit: string;
  icon: string;
  color: string;
  goal: number;
  current: number;
  sparkline: number[];
}

interface ActivityEntry {
  id: string;
  name: string;
  time: string;
  duration: string;
  icon: string;
  iconBg: string;
  value: string;
  valueUnit: string;
}

const STATS: StatData[] = [
  {
    id: 'steps',
    label: 'Daily Steps',
    value: 8432,
    unit: 'steps',
    icon: '🦶',
    color: COLORS.primary,
    goal: 10000,
    current: 8432,
    sparkline: [6100, 7200, 5800, 8900, 7400, 6800, 8432],
  },
  {
    id: 'heart',
    label: 'Heart Rate',
    value: 62,
    unit: 'bpm',
    icon: '❤️',
    color: COLORS.danger,
    goal: 100,
    current: 62,
    sparkline: [68, 72, 65, 78, 71, 64, 62],
  },
  {
    id: 'sleep',
    label: 'Sleep',
    value: 7.4,
    unit: 'h',
    icon: '🌙',
    color: COLORS.purple,
    goal: 8,
    current: 7.4,
    sparkline: [6.5, 7.2, 5.8, 8.1, 7.0, 6.9, 7.4],
  },
  {
    id: 'calories',
    label: 'Burned',
    value: 580,
    unit: 'kcal',
    icon: '🔥',
    color: COLORS.warn,
    goal: 1000,
    current: 580,
    sparkline: [420, 580, 390, 710, 520, 480, 580],
  },
];

const ACTIVITIES: ActivityEntry[] = [
  {
    id: 'run',
    name: 'Morning run',
    time: '6:42 AM',
    duration: '28 min',
    icon: '🏃',
    iconBg: 'rgba(239,68,68,0.1)',
    value: '5.2',
    valueUnit: 'km',
  },
  {
    id: 'meditation',
    name: 'Mindfulness',
    time: '7:30 AM',
    duration: '10 min',
    icon: '🧘',
    iconBg: 'rgba(124,58,237,0.1)',
    value: '10',
    valueUnit: 'min',
  },
  {
    id: 'water',
    name: 'Hydration logged',
    time: '8:15 AM',
    duration: 'tracking',
    icon: '💧',
    iconBg: 'rgba(14,165,233,0.1)',
    value: '500',
    valueUnit: 'ml',
  },
  {
    id: 'strength',
    name: 'Strength training',
    time: '10:00 AM',
    duration: '35 min',
    icon: '🏋️',
    iconBg: 'rgba(245,158,11,0.1)',
    value: '312',
    valueUnit: 'kcal',
  },
];

const GOALS = [
  { label: 'Steps', pct: 84, color: COLORS.primary },
  { label: 'Active min', pct: 72, color: COLORS.accent },
  { label: 'Calories', pct: 58, color: COLORS.warn },
  { label: 'Hydration', pct: 90, color: COLORS.sky },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 900, delay = 0) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const startTime = Date.now();
      const tick = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(2, -10 * progress);
        setValue(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);

  return value;
}

function useFadeSlide(delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
    ]).start();
  }, []);

  return { opacity, transform: [{ translateY }] };
}

// ─── Reusable Components ─────────────────────────────────────────────────────

// Sparkline mini chart
const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  const W = 102, H = 28, PAD = 2;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const xStep = (W - PAD * 2) / (data.length - 1);
  const points = data
    .map((v, i) => `${PAD + i * xStep},${H - PAD - ((v - min) / range) * (H - PAD * 2)}`)
    .join(' ');
  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.7}
      />
    </Svg>
  );
};

// Health Score Ring with animated draw-in
const HealthScoreRing = ({ score }: { score: number }) => {
  const displayScore = useCountUp(score, 900, 400);
  const strokeAnim = useRef(new Animated.Value(0)).current;
  const R = 40;
  const CIRC = 2 * Math.PI * R;
  const targetOffset = CIRC * (1 - score / 100);

  useEffect(() => {
    Animated.timing(strokeAnim, {
      toValue: 1,
      duration: 1200,
      delay: 300,
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, []);

  const strokeDashoffset = strokeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRC, targetOffset],
  });

  return (
    <View style={styles.ringWrap}>
      <Svg width={100} height={100} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={COLORS.scoreGradientA} />
            <Stop offset="100%" stopColor={COLORS.scoreGradientB} />
          </LinearGradient>
        </Defs>
        {/* Track */}
        <Circle cx={50} cy={50} r={R} fill="none" stroke={COLORS.border} strokeWidth={8} />
        {/* Animated arc — use AnimatedCircle workaround */}
        <Circle
          cx={50}
          cy={50}
          r={R}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={`${CIRC}`}
          strokeDashoffset={CIRC * (1 - score / 100)}
          transform="rotate(-90 50 50)"
        />
      </Svg>
      <View style={styles.ringCenter}>
        <Text style={styles.ringNum}>{displayScore}</Text>
        <Text style={styles.ringLabel}>SCORE</Text>
      </View>
    </View>
  );
};

// StatCard component
const StatCard = ({ stat }: { stat: StatData }) => {
  const barAnim = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const progress = stat.current / stat.goal;

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: progress,
      duration: 1000,
      delay: 300,
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, []);

  const handlePress = useCallback(() => {
    Vibration.vibrate(10);
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  }, []);

  const barWidth = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', `${Math.min(progress * 100, 100)}%`],
  });

  return (
    <Animated.View style={[{ transform: [{ scale }] }]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={1} style={styles.statCard}>
        <Text style={styles.statIcon}>{stat.icon}</Text>
        <View style={styles.statValueRow}>
          <Text style={styles.statValue}>
            {typeof stat.value === 'number' && stat.value > 100
              ? stat.value.toLocaleString()
              : stat.value}
          </Text>
          <Text style={styles.statUnit}> {stat.unit}</Text>
        </View>
        <Text style={styles.statLabel}>{stat.label}</Text>
        <View style={styles.progTrack}>
          <Animated.View style={[styles.progFill, { width: barWidth, backgroundColor: stat.color }]} />
        </View>
        <Sparkline data={stat.sparkline} color={stat.color} />
      </TouchableOpacity>
    </Animated.View>
  );
};

// InsightCard with gradient border
const InsightCard = () => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(() => {
    Vibration.vibrate(12);
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.98, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity onPress={handlePress} activeOpacity={1}>
        {/* Gradient border via nested views */}
        <View style={styles.insightGradientBorder}>
          <View style={styles.insightInner}>
            <View style={styles.insightTop}>
              <View style={styles.aiChip}>
                <Text style={styles.aiChipText}>AI INSIGHT</Text>
              </View>
              <Text style={styles.insightTimestamp}>Updated 6 min ago</Text>
            </View>
            <Text style={styles.insightTitle}>Your recovery window looks strong today</Text>
            <Text style={styles.insightBody}>
              Your HRV is 14% above your 7-day average and resting HR is down 3 bpm.
              This is an ideal window for high-intensity training — your body is primed.
            </Text>
            <View style={styles.insightActions}>
              <TouchableOpacity style={styles.btnPrimary}>
                <Text style={styles.btnPrimaryText}>Start workout</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSecondary}>
                <Text style={styles.btnSecondaryText}>See analysis</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Goal progress bar
const GoalRow = ({
  label,
  pct,
  color,
  delay,
}: {
  label: string;
  pct: number;
  color: string;
  delay: number;
}) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: pct / 100,
      duration: 1200,
      delay,
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, []);

  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${pct}%`] });

  return (
    <View style={styles.goalRow}>
      <Text style={styles.goalName}>{label}</Text>
      <View style={styles.goalTrack}>
        <Animated.View style={[styles.goalFill, { width, backgroundColor: color }]} />
      </View>
      <Text style={styles.goalPct}>{pct}%</Text>
    </View>
  );
};

// Activity row item
const ActivityRow = ({ item }: { item: ActivityEntry }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(() => {
    Vibration.vibrate(8);
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.98, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 160, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={1}
        style={styles.activityRow}
      >
        <View style={[styles.actIcon, { backgroundColor: item.iconBg }]}>
          <Text style={{ fontSize: 18 }}>{item.icon}</Text>
        </View>
        <View style={styles.actInfo}>
          <Text style={styles.actName}>{item.name}</Text>
          <Text style={styles.actTime}>{item.time} · {item.duration}</Text>
        </View>
        <View style={styles.actValue}>
          <Text style={styles.actNum}>{item.value}</Text>
          <Text style={styles.actUnit}>{item.valueUnit}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Section label
const SectionLabel = ({
  text,
  delay = 0,
}: {
  text: string;
  delay?: number;
}) => {
  const anim = useFadeSlide(delay);
  return (
    <Animated.Text style={[styles.sectionLabel, anim]}>
      {text}
    </Animated.Text>
  );
};

// ─── Dashboard Screen ─────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const score = 83;
  const headerAnim = useFadeSlide(0);
  const scoreAnim = useFadeSlide(100);
  const statsAnim = useFadeSlide(200);
  const progressAnim = useFadeSlide(280);
  const insightAnim = useFadeSlide(300);
  const activityAnim = useFadeSlide(350);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const now = new Date();
  const dateStr = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerAnim]}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>Good morning, Daniel 👋</Text>
              <Text style={styles.dateStr}>{dateStr}</Text>
            </View>
            <TouchableOpacity style={styles.avatar}>
              <Text style={styles.avatarText}>D</Text>
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Health Score */}
        <Animated.View style={[styles.scoreSection, scoreAnim]}>
          <View style={styles.scoreCard}>
            <HealthScoreRing score={score} />
            <View style={styles.scoreInfo}>
              <Text style={styles.scoreTitle}>Health Score</Text>
              <Text style={styles.scoreSub}>
                Excellent — you're in the top 18% of your age group
              </Text>
              <View style={styles.scoreDelta}>
                <Text style={styles.scoreDeltaText}>↑ 4 pts</Text>
                <Text style={styles.scoreDeltaMuted}> vs yesterday</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Vitals */}
        <SectionLabel text="VITALS" delay={150} />
        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsScroll}
          style={[statsAnim]}
        >
          {STATS.map(stat => <StatCard key={stat.id} stat={stat} />)}
        </Animated.ScrollView>

        {/* Goals */}
        <SectionLabel text="TODAY'S GOALS" delay={250} />
        <Animated.View style={[styles.sectionPad, progressAnim]}>
          <View style={styles.card}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalHeaderTitle}>Activity progress</Text>
              <Text style={styles.goalHeaderPct}>78% complete</Text>
            </View>
            {GOALS.map((g, i) => (
              <GoalRow key={g.label} {...g} delay={400 + i * 100} />
            ))}
          </View>
        </Animated.View>

        {/* AI Insight */}
        <SectionLabel text="AI INSIGHT" delay={300} />
        <Animated.View style={[styles.sectionPad, insightAnim]}>
          <InsightCard />
        </Animated.View>

        {/* Recent Activity */}
        <SectionLabel text="RECENT ACTIVITY" delay={340} />
        <Animated.View style={[styles.sectionPad, activityAnim]}>
          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <Text style={styles.activityHeaderTitle}>Today's log</Text>
              <Text style={styles.viewAll}>View all</Text>
            </View>
            {ACTIVITIES.map(item => <ActivityRow key={item.id} item={item} />)}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {[
          { icon: '⊕', label: 'Home', active: true },
          { icon: '◎', label: 'Activity', active: false },
          { icon: '▦', label: 'Insights', active: false },
          { icon: '◉', label: 'Profile', active: false },
        ].map(tab => (
          <TouchableOpacity key={tab.label} style={styles.tab} activeOpacity={0.7}>
            <Text style={[styles.tabIcon, tab.active && styles.tabIconActive]}>
              {tab.icon}
            </Text>
            <Text style={[styles.tabLabel, tab.active && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            {tab.active && <View style={styles.tabPip} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  // Header
  header: { padding: SPACING.lg, paddingBottom: 0 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greeting: { fontSize: 22, fontWeight: '500', color: COLORS.text, letterSpacing: -0.3 },
  dateStr: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '500', color: '#fff' },
  notifDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.danger,
    position: 'absolute', top: 0, right: 0,
    borderWidth: 2, borderColor: COLORS.background,
  },

  // Health Score
  scoreSection: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
  scoreCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  ringWrap: { width: 100, height: 100, position: 'relative' },
  ringCenter: {
    position: 'absolute', inset: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  ringNum: { fontSize: 26, fontWeight: '500', color: COLORS.text, letterSpacing: -0.5 },
  ringLabel: { fontSize: 10, color: COLORS.muted, letterSpacing: 0.5, marginTop: 1 },
  scoreInfo: { flex: 1 },
  scoreTitle: { fontSize: 15, fontWeight: '500', color: COLORS.text, marginBottom: 4 },
  scoreSub: { fontSize: 13, color: COLORS.muted, lineHeight: 18 },
  scoreDelta: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,196,140,0.1)',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 20, marginTop: 8, alignSelf: 'flex-start',
  },
  scoreDeltaText: { fontSize: 12, fontWeight: '500', color: COLORS.accent },
  scoreDeltaMuted: { fontSize: 12, color: COLORS.muted },

  // Section label
  sectionLabel: {
    fontSize: 11, fontWeight: '500', color: COLORS.muted,
    textTransform: 'uppercase', letterSpacing: 0.8,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg, marginBottom: SPACING.sm,
  },
  sectionPad: { paddingHorizontal: SPACING.lg },

  // Stats
  statsScroll: { paddingHorizontal: SPACING.lg, gap: 10 },
  statCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.sm,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    padding: 14,
    width: 130,
  },
  statIcon: { fontSize: 14, marginBottom: 8 },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline' },
  statValue: { fontSize: 20, fontWeight: '500', color: COLORS.text, letterSpacing: -0.3 },
  statUnit: { fontSize: 12, color: COLORS.muted },
  statLabel: { fontSize: 12, color: COLORS.muted, marginTop: 4 },
  progTrack: {
    height: 3, backgroundColor: COLORS.border,
    borderRadius: 2, marginTop: 10, overflow: 'hidden',
  },
  progFill: { height: '100%', borderRadius: 2 },

  // Goals
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  goalHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: SPACING.md,
  },
  goalHeaderTitle: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  goalHeaderPct: { fontSize: 13, fontWeight: '500', color: COLORS.accent },
  goalRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 12,
  },
  goalName: { fontSize: 12, color: COLORS.muted, width: 70 },
  goalTrack: {
    flex: 1, height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3, overflow: 'hidden',
  },
  goalFill: { height: '100%', borderRadius: 3 },
  goalPct: { fontSize: 12, fontWeight: '500', color: COLORS.text, width: 36, textAlign: 'right' },

  // AI Insight
  insightGradientBorder: {
    borderRadius: RADIUS.card,
    padding: 1,
    // Note: for true gradient border use LinearGradient from expo-linear-gradient
    backgroundColor: COLORS.primary,
    opacity: 0.85,
  },
  insightInner: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card - 1,
    padding: SPACING.md,
  },
  insightTop: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 10,
  },
  aiChip: {
    backgroundColor: 'rgba(26,86,219,0.1)',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 20,
  },
  aiChipText: {
    fontSize: 11, fontWeight: '500',
    color: COLORS.primary, letterSpacing: 0.3,
  },
  insightTimestamp: { fontSize: 11, color: COLORS.muted },
  insightTitle: {
    fontSize: 14, fontWeight: '500',
    color: COLORS.text, marginBottom: 4,
  },
  insightBody: { fontSize: 13, color: COLORS.muted, lineHeight: 19 },
  insightActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20,
  },
  btnPrimaryText: { fontSize: 12, fontWeight: '500', color: '#fff' },
  btnSecondary: {
    borderWidth: 0.5, borderColor: COLORS.border,
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20,
  },
  btnSecondaryText: { fontSize: 12, fontWeight: '500', color: COLORS.text },

  // Activity
  activityCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.card,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  activityHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md, paddingBottom: 12,
  },
  activityHeaderTitle: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  viewAll: { fontSize: 12, color: COLORS.primary },
  activityRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 10, paddingHorizontal: SPACING.md,
    borderTopWidth: 0.5, borderTopColor: COLORS.border,
  },
  actIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  actInfo: { flex: 1 },
  actName: { fontSize: 13, fontWeight: '500', color: COLORS.text },
  actTime: { fontSize: 12, color: COLORS.muted, marginTop: 1 },
  actValue: { alignItems: 'flex-end' },
  actNum: { fontSize: 13, fontWeight: '500', color: COLORS.text },
  actUnit: { fontSize: 11, color: COLORS.muted },

  // Tab Bar
  tabBar: {
    position: 'absolute', bottom: 0,
    left: 0, right: 0,
    backgroundColor: COLORS.card,
    borderTopWidth: 0.5, borderTopColor: COLORS.border,
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    justifyContent: 'space-around',
  },
  tab: { alignItems: 'center', paddingHorizontal: SPACING.md, gap: 4 },
  tabIcon: { fontSize: 20, color: COLORS.muted },
  tabIconActive: { color: COLORS.primary },
  tabLabel: { fontSize: 10, color: COLORS.muted, fontWeight: '500', letterSpacing: 0.3 },
  tabLabelActive: { color: COLORS.primary },
  tabPip: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: COLORS.primary, marginTop: 2,
  },
});
