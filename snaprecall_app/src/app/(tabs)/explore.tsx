import React from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const tips = [
  {
    emoji: '📸',
    title: 'Capture Screenshots',
    desc: 'Upload screenshots of lecture slides, code snippets, book pages, or any study material to get started.',
  },
  {
    emoji: '🔍',
    title: 'Semantic Search',
    desc: 'Use natural language to search your screenshots. Ask "explain gradient descent" and find the right slide instantly.',
  },
  {
    emoji: '🤖',
    title: 'Ask AI (RAG)',
    desc: 'Ask questions and get answers directly sourced from your own saved screenshots using AI-powered retrieval.',
  },
  {
    emoji: '⚡',
    title: 'OCR Powered',
    desc: 'Every uploaded screenshot is processed with OCR to extract all text, making it fully searchable.',
  },
  {
    emoji: '☁️',
    title: 'Cloud Stored',
    desc: 'Your screenshots are securely stored in the cloud via Cloudinary so you can access them from anywhere.',
  },
];

export default function ExploreScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.headerEmoji}>💡</Text>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Tips & Features</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Get the most out of SnapRecall
          </Text>
        </View>

        {/* Tips List */}
        <View style={styles.tipsContainer}>
          {tips.map((tip, index) => (
            <View key={index} style={[styles.tipCard, { backgroundColor: theme.backgroundElement }]}>
              <Text style={styles.tipEmoji}>{tip.emoji}</Text>
              <View style={styles.tipContent}>
                <Text style={[styles.tipTitle, { color: theme.text }]}>{tip.title}</Text>
                <Text style={[styles.tipDesc, { color: theme.textSecondary }]}>{tip.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* About Section */}
        <View style={[styles.aboutCard, { backgroundColor: theme.backgroundElement }]}>
          <Text style={[styles.aboutTitle, { color: theme.text }]}>About SnapRecall</Text>
          <Text style={[styles.aboutText, { color: theme.textSecondary }]}>
            SnapRecall is your AI-powered visual knowledge base. Capture, search, and recall your
            learning materials instantly using semantic search and RAG-based AI.
          </Text>
          <View style={styles.versionRow}>
            <Text style={[styles.versionLabel, { color: theme.textSecondary }]}>Version</Text>
            <Text style={[styles.versionValue, { color: theme.text }]}>1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: BottomTabInset + Spacing.five,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing.five,
    paddingTop: Spacing.three,
  },
  headerEmoji: {
    fontSize: 52,
    marginBottom: Spacing.two,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  tipsContainer: {
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  tipCard: {
    borderRadius: 14,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
      web: { boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
    }),
  },
  tipEmoji: {
    fontSize: 28,
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  tipDesc: {
    fontSize: 13,
    lineHeight: 20,
  },
  aboutCard: {
    borderRadius: 14,
    padding: Spacing.four,
    gap: Spacing.three,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
      web: { boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
    }),
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  versionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  versionValue: {
    fontSize: 13,
    fontWeight: '700',
  },
});
