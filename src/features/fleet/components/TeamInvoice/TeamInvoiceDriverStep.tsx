/**
 * TeamInvoiceDriverStep Component
 * Step 1: Select date range and drivers for team invoice
 */

import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { formatCurrencyPrecise, formatDate } from '../shared';
import { styles } from './TeamInvoiceModal.styles';
import type { DriverWithEvents, DateRangeOption, DateRange } from './types';

interface TeamInvoiceDriverStepProps {
  dateRange: DateRangeOption;
  dateRangeValues: DateRange;
  onDateRangeChange: (range: DateRangeOption) => void;
  drivers: DriverWithEvents[];
  selectedDriverIds: Set<string>;
  onToggleDriver: (driverId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

const DATE_RANGE_OPTIONS: { value: DateRangeOption; label: string }[] = [
  { value: 'week', label: 'Last 7 Days' },
  { value: 'biweekly', label: 'Last 14 Days' },
  { value: 'month', label: 'Last 30 Days' },
];

export function TeamInvoiceDriverStep({
  dateRange,
  dateRangeValues,
  onDateRangeChange,
  drivers,
  selectedDriverIds,
  onToggleDriver,
  onSelectAll,
  onClearSelection,
}: TeamInvoiceDriverStepProps) {
  const theme = colors.dark;

  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
      {/* Date Range Picker */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Date Range
        </Text>
        <View style={styles.dateOptions}>
          {DATE_RANGE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.dateOption,
                { backgroundColor: theme.card },
                dateRange === option.value && {
                  borderColor: theme.primary,
                  borderWidth: 2,
                },
              ]}
              onPress={() => onDateRangeChange(option.value)}
            >
              <Text
                style={[
                  styles.dateOptionText,
                  { color: theme.textPrimary },
                  dateRange === option.value && { color: theme.primary },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.dateRangeInfo, { color: theme.textSecondary }]}>
          {formatDate(dateRangeValues.start)} - {formatDate(dateRangeValues.end)}
        </Text>
      </View>

      {/* Driver Selection */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Select Drivers
          </Text>
          <View style={styles.selectionControls}>
            <TouchableOpacity onPress={onSelectAll}>
              <Text style={[styles.selectionLink, { color: theme.primary }]}>
                All
              </Text>
            </TouchableOpacity>
            <Text style={[styles.selectionDivider, { color: theme.textDisabled }]}>
              |
            </Text>
            <TouchableOpacity onPress={onClearSelection}>
              <Text style={[styles.selectionLink, { color: theme.primary }]}>
                None
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {drivers.map((driver) => (
          <TouchableOpacity
            key={driver.id}
            style={[
              styles.driverRow,
              { backgroundColor: theme.card },
              selectedDriverIds.has(driver.id) && {
                borderColor: theme.primary,
                borderWidth: 2,
              },
            ]}
            onPress={() => onToggleDriver(driver.id)}
          >
            <View style={styles.checkbox}>
              {selectedDriverIds.has(driver.id) && (
                <Text style={styles.checkmark}>OK</Text>
              )}
            </View>
            <View style={styles.driverInfo}>
              <Text style={[styles.driverName, { color: theme.textPrimary }]}>
                {driver.name || driver.email || 'Unknown Driver'}
              </Text>
              <Text style={[styles.driverStats, { color: theme.textSecondary }]}>
                {driver.eventCount} events - {formatCurrencyPrecise(driver.totalAmount)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
