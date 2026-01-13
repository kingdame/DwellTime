/**
 * TeamInvoiceEventStep Component
 * Step 2: Select specific events for team invoice
 */

import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { formatCurrencyPrecise, formatDate } from '../shared';
import { styles } from './TeamInvoiceModal.styles';
import type { DriverWithEvents } from './types';

interface TeamInvoiceEventStepProps {
  drivers: DriverWithEvents[];
  selectedEventIds: Set<string>;
  onToggleEvent: (eventId: string) => void;
}

export function TeamInvoiceEventStep({
  drivers,
  selectedEventIds,
  onToggleEvent,
}: TeamInvoiceEventStepProps) {
  const theme = colors.dark;

  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
      {drivers.map((driver) => (
        <View key={driver.id} style={styles.driverEventsSection}>
          <Text style={[styles.driverHeader, { color: theme.textPrimary }]}>
            {driver.name || driver.email || 'Unknown Driver'}
          </Text>
          {driver.events.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={[
                styles.eventRow,
                { backgroundColor: theme.card },
                selectedEventIds.has(event.id) && {
                  borderColor: theme.primary,
                  borderWidth: 2,
                },
              ]}
              onPress={() => onToggleEvent(event.id)}
            >
              <View style={styles.checkbox}>
                {selectedEventIds.has(event.id) && (
                  <Text style={styles.checkmark}>OK</Text>
                )}
              </View>
              <View style={styles.eventInfo}>
                <Text
                  style={[styles.eventFacility, { color: theme.textPrimary }]}
                  numberOfLines={1}
                >
                  {(event as any).facility_name || 'Unknown Facility'}
                </Text>
                <Text style={[styles.eventDate, { color: theme.textSecondary }]}>
                  {formatDate(new Date(event.arrival_time))}
                </Text>
              </View>
              <Text style={[styles.eventAmount, { color: theme.success }]}>
                {formatCurrencyPrecise(event.total_amount)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}
