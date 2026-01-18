/**
 * Legal Screen - Terms of Service and Privacy Policy
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../src/constants/colors';

type TabType = 'terms' | 'privacy';

// Terms of Service Content
const TERMS_OF_SERVICE = `
TERMS OF SERVICE

Last Updated: January 2026

1. ACCEPTANCE OF TERMS

By downloading, accessing, or using the DwellTime mobile application ("App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the App.

2. DESCRIPTION OF SERVICE

DwellTime is a detention time tracking and invoicing application designed for trucking professionals. The App allows users to:
- Track arrival and departure times at facilities
- Calculate detention charges based on configurable rates
- Generate and send invoices
- Save and review facilities
- Manage fleet operations (for applicable subscription tiers)

3. USER ACCOUNTS

3.1 Registration: You must create an account to use the App. You agree to provide accurate, current, and complete information during registration.

3.2 Account Security: You are responsible for maintaining the confidentiality of your account credentials. Notify us immediately of any unauthorized use of your account.

3.3 Age Requirement: You must be at least 18 years old to use this App.

4. SUBSCRIPTION PLANS

4.1 Free Tier: Limited features available at no cost.

4.2 Paid Subscriptions: Pro, Small Fleet, Fleet, and Enterprise plans are available on a monthly or annual basis.

4.3 Billing: Subscriptions are billed in advance. All fees are non-refundable except as required by law.

4.4 Cancellation: You may cancel your subscription at any time. Access continues until the end of the current billing period.

5. USER CONTENT

5.1 Ownership: You retain ownership of all content you submit to the App (photos, notes, reviews, etc.).

5.2 License: By submitting content, you grant DwellTime a non-exclusive, worldwide, royalty-free license to use, store, and display such content for the purpose of operating the App.

5.3 Prohibited Content: You agree not to submit content that is illegal, harmful, threatening, abusive, defamatory, or otherwise objectionable.

6. PROHIBITED CONDUCT

You agree not to:
- Use the App for any illegal purpose
- Interfere with or disrupt the App's operation
- Attempt to gain unauthorized access to our systems
- Impersonate any person or entity
- Use automated means to access the App without permission

7. INTELLECTUAL PROPERTY

The App and its original content, features, and functionality are owned by DwellTime and are protected by international copyright, trademark, and other intellectual property laws.

8. DISCLAIMER OF WARRANTIES

THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE APP WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.

9. LIMITATION OF LIABILITY

TO THE MAXIMUM EXTENT PERMITTED BY LAW, DWELLTIME SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF YOUR USE OF THE APP.

10. INDEMNIFICATION

You agree to indemnify and hold harmless DwellTime and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses arising out of your use of the App or violation of these Terms.

11. MODIFICATIONS TO SERVICE

We reserve the right to modify or discontinue the App at any time without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance.

12. GOVERNING LAW

These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.

13. CHANGES TO TERMS

We may update these Terms from time to time. We will notify you of any changes by posting the new Terms on this page and updating the "Last Updated" date.

14. CONTACT US

If you have any questions about these Terms, please contact us at:
Email: legal@dwelltime.app
`;

// Privacy Policy Content
const PRIVACY_POLICY = `
PRIVACY POLICY

Last Updated: January 2026

1. INTRODUCTION

DwellTime ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.

2. INFORMATION WE COLLECT

2.1 Personal Information:
- Name and email address (for account creation)
- Phone number (optional)
- Company name (optional)
- Payment information (processed by Stripe)

2.2 Location Data:
- GPS coordinates (only when actively tracking detention events)
- Facility addresses you search for or save

2.3 Usage Data:
- App features accessed
- Time spent in the App
- Device information (model, operating system)

2.4 Content You Provide:
- Photos of detention events
- Notes and comments
- Facility reviews

3. HOW WE USE YOUR INFORMATION

We use the information we collect to:
- Provide, maintain, and improve our services
- Process transactions and send related information
- Send administrative messages and notifications
- Respond to your comments, questions, and requests
- Monitor and analyze trends, usage, and activities
- Detect, investigate, and prevent fraudulent transactions

4. LOCATION DATA

4.1 Collection: We collect location data ONLY when you are actively tracking a detention event. This allows us to:
- Verify your presence at a facility
- Calculate accurate detention times
- Provide location-based facility suggestions

4.2 Control: You can disable location tracking at any time through your device settings. However, some features may not function properly without location access.

4.3 Storage: Location data is stored securely and retained only as long as necessary for the purpose it was collected.

5. DATA SHARING

We do not sell your personal information. We may share your information with:

5.1 Service Providers:
- Clerk (authentication)
- Convex (database)
- Stripe (payment processing)
- Cloudflare (hosting and security)

5.2 Legal Requirements:
We may disclose your information if required by law or in response to valid requests by public authorities.

5.3 Business Transfers:
In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.

6. DATA SECURITY

We implement appropriate technical and organizational measures to protect your personal information, including:
- Encryption in transit (TLS)
- Encryption at rest
- Regular security assessments
- Access controls and authentication

7. DATA RETENTION

We retain your personal information for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data at any time.

8. YOUR RIGHTS

You have the right to:
- Access your personal information
- Correct inaccurate data
- Request deletion of your data
- Export your data
- Opt out of marketing communications
- Withdraw consent for data processing

To exercise these rights, contact us at privacy@dwelltime.app.

9. CHILDREN'S PRIVACY

Our App is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children.

10. INTERNATIONAL DATA TRANSFERS

Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information.

11. CALIFORNIA PRIVACY RIGHTS

California residents have additional rights under the CCPA:
- Right to know what personal information is collected
- Right to delete personal information
- Right to opt out of the sale of personal information (we do not sell personal information)
- Right to non-discrimination

12. CHANGES TO THIS POLICY

We may update this Privacy Policy from time to time. We will notify you of any changes by:
- Updating the "Last Updated" date
- Sending you a notification within the App

13. CONTACT US

For privacy-related inquiries:
Email: privacy@dwelltime.app

Data Protection Officer:
DwellTime Inc.
Attn: Privacy Team
Email: dpo@dwelltime.app
`;

export default function LegalScreen() {
  const theme = colors.dark;
  const [activeTab, setActiveTab] = useState<TabType>('terms');

  const handleTabChange = useCallback((tab: TabType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Tab Switcher */}
      <View style={[styles.tabBar, { backgroundColor: theme.card }]}>
        <Pressable
          style={[
            styles.tab,
            activeTab === 'terms' && { backgroundColor: theme.primary + '20' },
          ]}
          onPress={() => handleTabChange('terms')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'terms' ? theme.primary : theme.textSecondary },
            ]}
          >
            Terms of Service
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.tab,
            activeTab === 'privacy' && { backgroundColor: theme.primary + '20' },
          ]}
          onPress={() => handleTabChange('privacy')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'privacy' ? theme.primary : theme.textSecondary },
            ]}
          >
            Privacy Policy
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={[styles.legalText, { color: theme.textPrimary }]}>
          {activeTab === 'terms' ? TERMS_OF_SERVICE : PRIVACY_POLICY}
        </Text>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    padding: 8,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  legalText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'monospace',
  },
  bottomPadding: {
    height: 40,
  },
});
