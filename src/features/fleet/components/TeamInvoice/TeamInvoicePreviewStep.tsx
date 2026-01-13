/**
 * TeamInvoicePreviewStep Component
 * Step 3: Preview and confirm team invoice
 */

import { View, Text, ScrollView } from 'react-native';
import { colors } from '@/constants/colors';
import { formatCurrencyPrecise, formatDate } from '../shared';
import { styles } from './TeamInvoiceModal.styles';
import type { DriverWithEvents, DateRange } from './types';
import type { DetentionEvent } from '@/shared/types';

interface TeamInvoicePreviewStepProps {
  dateRangeValues: DateRange;
  selectedDriverIds: Set<string>;
  selectedEvents: DetentionEvent[];
  totalAmount: number;
  drivers: DriverWithEvents[];
  selectedEventIds: Set<string>;
}

export function TeamInvoicePreviewStep({
  dateRangeValues,
  selectedDriverIds,
  selectedEvents,
  totalAmount,
  drivers,
  selectedEventIds,
}: TeamInvoicePreviewStepProps) {
  const theme = colors.dark;

  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
      <View style={[styles.previewCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.previewTitle, { color: theme.textPrimary }]}>
          Invoice Summary
        </Text>
        <View style={styles.previewRow}>
          <Text style={[styles.previewLabel, { color: theme.textSecondary }]}>
            Date Range
          </Text>
          <Text style={[styles.previewValue, { color: theme.textPrimary }]}>
            {formatDate(dateRangeValues.start)} - {formatDate(dateRangeValues.end)}
          </Text>
        </View>
        <View style={styles.previewRow}>
          <Text style={[styles.previewLabel, { color: theme.textSecondary }]}>
            Drivers
          </Text>
          <Text style={[styles.previewValue, { color: theme.textPrimary }]}>
            {selectedDriverIds.size}
          </Text>
        </View>
        <View style={styles.previewRow}>
          <Text style={[styles.previewLabel, { color: theme.textSecondary }]}>
            Events
          </Text>
          <Text style={[styles.previewValue, { color: theme.textPrimary }]}>
            {selectedEvents.length}
          </Text>
        </View>
        <View style={[styles.previewTotal, { borderTopColor: theme.divider }]}>
          <Text style={[styles.previewTotalLabel, { color: theme.textSecondary }]}>
            Total Amount
          </Text>
          <Text style={[styles.previewTotalValue, { color: theme.success }]}>
            {formatCurrencyPrecise(totalAmount)}
          </Text>
        </View>
      </View>

      {/* Driver Breakdown */}
      <Text style={[styles.breakdownTitle, { color: theme.textPrimary }]}>
        Breakdown by Driver
      </Text>
      {drivers.map((driver) => {
        const driverEvents = driver.events.filter((e) =>
          selectedEventIds.has(e.id)
        );
        const driverTotal = driverEvents.reduce(
          (sum, e) => sum + e.total_amount,
          0
        );
        return (
          <View
            key={driver.id}
            style={[styles.breakdownRow, { backgroundColor: theme.card }]}
          >
            <View>
              <Text style={[styles.breakdownName, { color: theme.textPrimary }]}>
                {driver.name || driver.email || 'Unknown'}
              </Text>
              <Text style={[styles.breakdownEvents, { color: theme.textSecondary }]}>
                {driverEvents.length} events
              </Text>
            </View>
            <Text style={[styles.breakdownAmount, { color: theme.success }]}>
              {formatCurrencyPrecise(driverTotal)}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}
