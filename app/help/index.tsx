/**
 * Help & Support Screen
 * FAQ accordion, contact options, and diagnostic info
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';
import { colors } from '../../src/constants/colors';

// FAQ Data
const FAQ_SECTIONS = [
  {
    title: 'Getting Started',
    items: [
      {
        question: 'How do I start tracking detention?',
        answer: 'Go to the Home tab and tap "Start Tracking". You can select or search for a facility, then confirm your arrival. The timer will automatically track your grace period and detention time.',
      },
      {
        question: 'What is the grace period?',
        answer: 'The grace period is the free time you\'re allowed at a facility before detention charges begin. By default, this is 2 hours (120 minutes), but you can customize it in your Profile settings.',
      },
      {
        question: 'How do I set my hourly rate?',
        answer: 'Go to Profile > Detention Settings to set your hourly rate. This rate will be used to calculate detention charges for all future events.',
      },
    ],
  },
  {
    title: 'Facilities',
    items: [
      {
        question: 'How do I add a new facility?',
        answer: 'On the Facilities tab, tap the "+" button or use the search to find a facility. You can add facilities from Google Maps results or create custom entries.',
      },
      {
        question: 'Can I save favorite facilities?',
        answer: 'Yes! When viewing a facility\'s details, tap the "Save" button to bookmark it for quick access later.',
      },
      {
        question: 'How do facility reviews work?',
        answer: 'After completing a detention event, you can rate the facility on wait time, staff helpfulness, and overall experience. Reviews help other drivers know what to expect.',
      },
    ],
  },
  {
    title: 'Invoicing',
    items: [
      {
        question: 'How do I create an invoice?',
        answer: 'Go to the Invoices tab and tap "Create Invoice". Select the detention events you want to include, add recipient details, and generate a professional PDF invoice.',
      },
      {
        question: 'Can I send invoices via email?',
        answer: 'Yes! After creating an invoice, tap "Send" to email it directly to your recipient with the PDF attached.',
      },
      {
        question: 'What payment methods can I accept?',
        answer: 'Invoices include your company information for the recipient to pay you directly. We don\'t process payments within the app.',
      },
    ],
  },
  {
    title: 'Subscription & Billing',
    items: [
      {
        question: 'What plans are available?',
        answer: 'We offer Free, Pro ($19/mo), Small Fleet ($49/mo), Fleet ($149/mo), and Enterprise plans. Pro is perfect for individual owner-operators, while fleet plans add driver management features.',
      },
      {
        question: 'How do I upgrade my plan?',
        answer: 'Go to Profile > Subscription to view available plans and upgrade. All paid plans include a 7-day free trial.',
      },
      {
        question: 'How do I cancel my subscription?',
        answer: 'Go to Profile > Subscription > Manage Subscription to cancel. You\'ll keep access until the end of your billing period.',
      },
    ],
  },
  {
    title: 'Privacy & Data',
    items: [
      {
        question: 'How is my data protected?',
        answer: 'We use industry-standard encryption for all data in transit and at rest. Your location data is only collected when you\'re actively tracking a detention event.',
      },
      {
        question: 'Can I export my data?',
        answer: 'Yes! Go to Profile > Export Data to download all your detention records, invoices, and reviews as a JSON file.',
      },
      {
        question: 'How do I delete my account?',
        answer: 'Contact support@dwelltime.app to request account deletion. This will permanently remove all your data from our systems.',
      },
    ],
  },
];

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const theme = colors.dark;
  const [isExpanded, setIsExpanded] = useState(false);
  const rotation = useSharedValue(0);
  const height = useSharedValue(0);

  const handleToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExpanded((prev) => !prev);
    rotation.value = withTiming(isExpanded ? 0 : 90, { duration: 200 });
  }, [isExpanded, rotation]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={[styles.faqItem, { backgroundColor: theme.card }]}>
      <Pressable style={styles.faqHeader} onPress={handleToggle}>
        <Text style={[styles.faqQuestion, { color: theme.textPrimary }]}>{question}</Text>
        <Animated.Text style={[styles.faqIcon, iconStyle]}>→</Animated.Text>
      </Pressable>
      {isExpanded && (
        <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>{answer}</Text>
      )}
    </View>
  );
}

export default function HelpScreen() {
  const theme = colors.dark;

  const handleEmailSupport = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL('mailto:support@dwelltime.app?subject=Help%20Request');
  }, []);

  const handleVisitWebsite = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL('https://dwelltime.app/help');
  }, []);

  const handleReportBug = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Collect diagnostic info
    const diagnosticInfo = `
App Version: ${Constants.expoConfig?.version || '1.0.0'}
Platform: ${Constants.platform?.ios ? 'iOS' : 'Android'}
Device: ${Constants.deviceName || 'Unknown'}
    `.trim();

    Alert.alert(
      'Report a Bug',
      'Would you like to email us with diagnostic information included?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Report',
          onPress: () => {
            const subject = encodeURIComponent('Bug Report - DwellTime App');
            const body = encodeURIComponent(`
Please describe the issue you encountered:




---
Diagnostic Info:
${diagnosticInfo}
            `);
            Linking.openURL(`mailto:support@dwelltime.app?subject=${subject}&body=${body}`);
          },
        },
      ]
    );
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Contact Options */}
        <View style={styles.contactSection}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Need Help?
          </Text>

          <Pressable
            style={[styles.contactCard, { backgroundColor: theme.primary + '15' }]}
            onPress={handleEmailSupport}
          >
            <Text style={styles.contactIcon}>📧</Text>
            <View style={styles.contactText}>
              <Text style={[styles.contactTitle, { color: theme.primary }]}>
                Email Support
              </Text>
              <Text style={[styles.contactSubtitle, { color: theme.textSecondary }]}>
                support@dwelltime.app
              </Text>
            </View>
            <Text style={styles.contactArrow}>→</Text>
          </Pressable>

          <Pressable
            style={[styles.contactCard, { backgroundColor: theme.card }]}
            onPress={handleVisitWebsite}
          >
            <Text style={styles.contactIcon}>🌐</Text>
            <View style={styles.contactText}>
              <Text style={[styles.contactTitle, { color: theme.textPrimary }]}>
                Visit Website
              </Text>
              <Text style={[styles.contactSubtitle, { color: theme.textSecondary }]}>
                Guides, tutorials, and more
              </Text>
            </View>
            <Text style={styles.contactArrow}>→</Text>
          </Pressable>

          <Pressable
            style={[styles.contactCard, { backgroundColor: theme.warning + '15' }]}
            onPress={handleReportBug}
          >
            <Text style={styles.contactIcon}>🐛</Text>
            <View style={styles.contactText}>
              <Text style={[styles.contactTitle, { color: theme.warning }]}>
                Report a Bug
              </Text>
              <Text style={[styles.contactSubtitle, { color: theme.textSecondary }]}>
                Help us improve the app
              </Text>
            </View>
            <Text style={styles.contactArrow}>→</Text>
          </Pressable>
        </View>

        {/* FAQ Sections */}
        {FAQ_SECTIONS.map((section) => (
          <View key={section.title} style={styles.faqSection}>
            <Text style={[styles.faqSectionTitle, { color: theme.textSecondary }]}>
              {section.title}
            </Text>
            {section.items.map((item) => (
              <FAQItem
                key={item.question}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </View>
        ))}

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appInfoText, { color: theme.textDisabled }]}>
            DwellTime v{Constants.expoConfig?.version || '1.0.0'}
          </Text>
          <Text style={[styles.appInfoText, { color: theme.textDisabled }]}>
            © 2026 DwellTime. All rights reserved.
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  contactSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  contactIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  contactText: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 13,
  },
  contactArrow: {
    fontSize: 18,
    opacity: 0.5,
  },
  faqSection: {
    marginBottom: 24,
  },
  faqSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  faqItem: {
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    paddingRight: 12,
  },
  faqIcon: {
    fontSize: 16,
    opacity: 0.6,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  appInfo: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
  },
  appInfoText: {
    fontSize: 12,
    marginBottom: 4,
  },
  bottomPadding: {
    height: 40,
  },
});
