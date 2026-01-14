/**
 * Recovery Screen
 * Full-screen recovery dashboard and invoice aging
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/constants/colors';
import {
  RecoveryDashboard,
  InvoiceAgingList,
  useRecoveryStats,
} from '../../src/features/recovery';

type ViewMode = 'dashboard' | 'aging';

export default function RecoveryScreen() {
  const theme = colors.dark;
  const router = useRouter();
  const { refetch, isLoading: _isLoading } = useRecoveryStats();

  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleBucketPress = useCallback((_bucket: string) => {
    setViewMode('aging');
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={[styles.backIcon, { color: theme.textPrimary }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Recovery
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Track your detention recovery
          </Text>
        </View>
      </View>

      {/* View Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === 'dashboard' && {
              backgroundColor: theme.primary,
            },
          ]}
          onPress={() => setViewMode('dashboard')}
        >
          <Text
            style={[
              styles.toggleText,
              {
                color:
                  viewMode === 'dashboard' ? '#FFFFFF' : theme.textSecondary,
              },
            ]}
          >
            Dashboard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === 'aging' && {
              backgroundColor: theme.primary,
            },
          ]}
          onPress={() => setViewMode('aging')}
        >
          <Text
            style={[
              styles.toggleText,
              {
                color: viewMode === 'aging' ? '#FFFFFF' : theme.textSecondary,
              },
            ]}
          >
            Aging
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
      >
        {viewMode === 'dashboard' ? (
          <RecoveryDashboard onBucketPress={handleBucketPress} />
        ) : (
          <InvoiceAgingList
            onInvoicePress={(invoice) => {
              router.push(`/invoice/${invoice.invoice_id}`);
            }}
            onSendReminder={(invoice) => {
              // Open send reminder modal
              router.push({
                pathname: '/invoice/send',
                params: { id: invoice.invoice_id },
              });
            }}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backIcon: {
    fontSize: 24,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#1A1A24',
    borderRadius: 10,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});
