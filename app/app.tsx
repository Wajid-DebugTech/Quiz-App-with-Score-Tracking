// App.js
// ------------------------------------------------------------
// React Native (Expo) demo app: Quiz with MCQs + Score Tracking + Review
// Features:
// - 3–4 options per question
// - Select an answer and go Next
// - Final score summary with optional review (shows correct answers)
// ------------------------------------------------------------
// How to run (Expo):
// 1) npx create-expo-app quiz-app && cd quiz-app
// 2) Replace the generated App.js with this file.
// 3) Install deps (icons are optional):
//    npm i @expo/vector-icons
// 4) Start: npx expo start
// ------------------------------------------------------------

import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ----------------------
// Demo Questions
// ----------------------
const QUESTIONS = [
  {
    id: 'q1',
    prompt: 'Which language runs in a web browser?',
    options: ['Java', 'C', 'Python', 'JavaScript'],
    correctIndex: 3,
  },
  {
    id: 'q2',
    prompt: 'Which one is a JavaScript framework?',
    options: ['Django', 'Laravel', 'React', 'Flask'],
    correctIndex: 2,
  },
  {
    id: 'q3',
    prompt: 'What does CSS stand for?',
    options: [
      'Central Style Sheets',
      'Cascading Style Sheets',
      'Cascading Simple Sheets',
      'Cars SUVs Sailboats',
    ],
    correctIndex: 1,
  },
  {
    id: 'q4',
    prompt: 'Which HTML tag is used to define an unordered list?',
    options: ['<ol>', '<ul>', '<li>', '<list>'],
    correctIndex: 1,
  },
  {
    id: 'q5',
    prompt: 'Inside which HTML element do we put the JavaScript?',
    options: ['<javascript>', '<scripting>', '<script>', '<js>'],
    correctIndex: 2,
  },
];

// ----------------------
// Components
// ----------------------
function ProgressBar({ progress }) {
  return (
    <View style={styles.progressWrap}>
      <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, progress * 100))}%` }]} />
    </View>
  );
}

function Option({ label, selected, correct, showState, onPress }) {
  const stateStyles = useMemo(() => {
    if (!showState) return {};
    if (correct) return { borderColor: '#10b981', backgroundColor: '#ecfdf5' }; // green
    if (selected && !correct) return { borderColor: '#ef4444', backgroundColor: '#fef2f2' }; // red
    return {};
  }, [showState, selected, correct]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.option, selected && styles.optionSelected, stateStyles]}>
      <View style={[styles.radio, selected && styles.radioSelected]} />
      <Text style={styles.optionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function QuestionCard({ index, total, question, selectedIndex, onSelect }) {
  return (
    <View style={styles.card}>
      <Text style={styles.qCounter}>Question {index + 1} / {total}</Text>
      <Text style={styles.qPrompt}>{question.prompt}</Text>
      <View style={{ height: 12 }} />
      {question.options.map((opt, i) => (
        <Option
          key={i}
          label={opt}
          selected={selectedIndex === i}
          showState={false}
          correct={false}
          onPress={() => onSelect(i)}
        />
      ))}
    </View>
  );
}

// ----------------------
// Main App
// ----------------------
export default function App() {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null); // selected option index for current question
  const [answers, setAnswers] = useState([]); // { qid, selectedIndex, isCorrect }
  const [finished, setFinished] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const total = QUESTIONS.length;
  const progress = (finished ? 1 : idx / total);

  const onNext = () => {
    if (selected === null) {
      Alert.alert('Choose an option', 'Please select an answer before continuing.');
      return;
    }
    const q = QUESTIONS[idx];
    const isCorrect = selected === q.correctIndex;

    const record = { qid: q.id, selectedIndex: selected, isCorrect };
    setAnswers((prev) => [...prev, record]);

    if (idx + 1 < total) {
      setIdx((v) => v + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  };

  const score = useMemo(() => answers.reduce((acc, a) => acc + (a.isCorrect ? 1 : 0), 0), [answers]);

  const onRestart = () => {
    setIdx(0);
    setSelected(null);
    setAnswers([]);
    setFinished(false);
    setShowReview(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Quiz Time</Text>
        {!finished ? (
          <Text style={styles.subtitle}>Score: {answers.filter((a) => a.isCorrect).length}</Text>
        ) : (
          <TouchableOpacity onPress={onRestart} style={styles.resetBtn}>
            <Ionicons name="refresh" size={16} color="#fff" />
            <Text style={styles.resetBtnText}>Restart</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
        <ProgressBar progress={progress} />
      </View>

      {/* Body */}
      {!finished ? (
        <View style={{ flex: 1, padding: 16 }}>
          <QuestionCard
            index={idx}
            total={total}
            question={QUESTIONS[idx]}
            selectedIndex={selected}
            onSelect={setSelected}
          />
        </View>
      ) : (
        <View style={{ flex: 1, padding: 16 }}>
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>All done!</Text>
            <Text style={styles.resultScore}>Your score</Text>
            <Text style={styles.resultBig}>{score} / {total}</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowReview((v) => !v)}>
              <Text style={styles.primaryBtnText}>{showReview ? 'Hide review' : 'Show correct answers'}</Text>
            </TouchableOpacity>
            <View style={{ height: 12 }} />
            <TouchableOpacity style={styles.secondaryBtn} onPress={onRestart}>
              <Text style={styles.secondaryBtnText}>Try again</Text>
            </TouchableOpacity>
          </View>

          {showReview && (
            <View style={{ marginTop: 16 }}>
              <Text style={styles.reviewTitle}>Review</Text>
              <FlatList
                data={QUESTIONS}
                keyExtractor={(q) => q.id}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                renderItem={({ item, index }) => {
                  const a = answers[index];
                  const picked = a?.selectedIndex;
                  const correct = item.correctIndex;
                  const isCorrect = a?.isCorrect;
                  return (
                    <View style={styles.reviewCard}>
                      <Text style={styles.reviewPrompt}>{index + 1}. {item.prompt}</Text>
                      {item.options.map((opt, i) => {
                        const chosen = i === picked;
                        const isRight = i === correct;
                        const bg = isRight ? '#ecfdf5' : chosen && !isRight ? '#fef2f2' : '#fff';
                        const br = isRight ? '#10b981' : chosen && !isRight ? '#ef4444' : '#e5e7eb';
                        return (
                          <View key={i} style={[styles.reviewOption, { backgroundColor: bg, borderColor: br }]}> 
                            <Text style={styles.reviewOptionText}>{opt}</Text>
                            {isRight && <Badge text="Correct" color="#10b981" />}
                            {chosen && !isRight && <Badge text="Your pick" color="#ef4444" />}
                          </View>
                        );
                      })}
                      <View style={{ marginTop: 8 }}>
                        <Text style={{ color: isCorrect ? '#10b981' : '#ef4444', fontWeight: '700' }}>
                          {isCorrect ? 'You answered correctly.' : 'Your answer was incorrect.'}
                        </Text>
                      </View>
                    </View>
                  );
                }}
              />
            </View>
          )}
        </View>
      )}

      {/* Footer */}
      {!finished && (
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.nextBtn, { backgroundColor: selected === null ? '#93c5fd' : '#3b82f6' }]} onPress={onNext}>
            <Text style={styles.nextBtnText}>{idx + 1 === total ? 'Finish' : 'Next'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

function Badge({ text, color }) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
}

// ----------------------
// Styles
// ----------------------
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 20, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 14, fontWeight: '700', color: '#374151' },
  resetBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, flexDirection: 'row', gap: 6, alignItems: 'center' },
  resetBtnText: { color: '#fff', fontWeight: '700' },

  progressWrap: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#3b82f6' },

  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  qCounter: { fontSize: 12, color: '#6b7280', fontWeight: '700' },
  qPrompt: { fontSize: 18, color: '#111827', fontWeight: '800', marginTop: 6, lineHeight: 24 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#e5e7eb', padding: 12, borderRadius: 12, backgroundColor: '#fff', marginTop: 10 },
  optionSelected: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
  radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#3b82f6' },
  radioSelected: { backgroundColor: '#3b82f6' },
  optionLabel: { fontSize: 14, color: '#111827' },

  footer: { padding: 16, borderTopWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  nextBtn: { height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  nextBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  resultCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  resultTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  resultScore: { marginTop: 6, fontSize: 14, color: '#6b7280' },
  resultBig: { marginTop: 8, fontSize: 40, fontWeight: '900', color: '#111827' },
  primaryBtn: { marginTop: 14, backgroundColor: '#3b82f6', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  primaryBtnText: { color: '#fff', fontWeight: '800' },
  secondaryBtn: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  secondaryBtnText: { color: '#111827', fontWeight: '800' },

  reviewTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  reviewCard: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e5e7eb', padding: 12 },
  reviewPrompt: { fontSize: 14, fontWeight: '800', color: '#111827' },
  reviewOption: { marginTop: 8, borderWidth: 1, borderRadius: 10, padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reviewOptionText: { fontSize: 14, color: '#111827' },

  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { color: '#fff', fontWeight: '800', fontSize: 10 },
});
