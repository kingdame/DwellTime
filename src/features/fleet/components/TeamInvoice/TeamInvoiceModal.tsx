/**
 * TeamInvoiceModal Component
 * Modal for creating consolidated team invoices
 */

import { useState, useCallback, useMemo } from 'react';
import { View, Text, Modal, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { colors } from '@/constants/colors';
import { formatCurrencyPrecise } from '../shared';
import { TeamInvoiceDriverStep } from './TeamInvoiceDriverStep';
import { TeamInvoiceEventStep } from './TeamInvoiceEventStep';
import { TeamInvoicePreviewStep } from './TeamInvoicePreviewStep';
import { styles } from './TeamInvoiceModal.styles';
import type { DriverWithEvents, DateRangeOption, InvoiceStep } from './types';

interface TeamInvoiceModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (data: { driverIds: string[]; eventIds: string[]; dateRange: { start: Date; end: Date } }) => Promise<void>;
  drivers: DriverWithEvents[];
  isLoading?: boolean;
}

function getDateRange(option: DateRangeOption): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  switch (option) {
    case 'week': start.setDate(start.getDate() - 7); break;
    case 'biweekly': start.setDate(start.getDate() - 14); break;
    case 'month': start.setMonth(start.getMonth() - 1); break;
    default: start.setDate(start.getDate() - 7);
  }
  return { start, end };
}

export function TeamInvoiceModal({ visible, onClose, onCreate, drivers, isLoading = false }: TeamInvoiceModalProps) {
  const theme = colors.dark;
  const [dateRange, setDateRange] = useState<DateRangeOption>('biweekly');
  const [selectedDriverIds, setSelectedDriverIds] = useState<Set<string>>(new Set(drivers.map((d) => d.id)));
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<InvoiceStep>('drivers');

  const dateRangeValues = useMemo(() => getDateRange(dateRange), [dateRange]);

  const driversWithFilteredEvents = useMemo(() => {
    return drivers.map((driver) => {
      const filteredEvents = driver.events.filter((event) => {
        const eventDate = new Date(event.arrival_time);
        return eventDate >= dateRangeValues.start && eventDate <= dateRangeValues.end && event.status === 'completed';
      });
      return { ...driver, events: filteredEvents, eventCount: filteredEvents.length, totalAmount: filteredEvents.reduce((sum, e) => sum + e.total_amount, 0) };
    });
  }, [drivers, dateRangeValues]);

  const selectedDrivers = useMemo(() => driversWithFilteredEvents.filter((d) => selectedDriverIds.has(d.id)), [driversWithFilteredEvents, selectedDriverIds]);

  const selectedEvents = useMemo(() => {
    const events: typeof drivers[0]['events'] = [];
    selectedDrivers.forEach((driver) => driver.events.forEach((event) => { if (selectedEventIds.has(event.id)) events.push(event); }));
    return events;
  }, [selectedDrivers, selectedEventIds]);

  const totalAmount = useMemo(() => selectedEvents.reduce((sum, e) => sum + e.total_amount, 0), [selectedEvents]);

  const handleNextToEvents = useCallback(() => {
    const allEventIds = new Set<string>();
    selectedDrivers.forEach((driver) => driver.events.forEach((event) => allEventIds.add(event.id)));
    setSelectedEventIds(allEventIds);
    setStep('events');
  }, [selectedDrivers]);

  const toggleDriver = (id: string) => setSelectedDriverIds((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const toggleEvent = (id: string) => setSelectedEventIds((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  const handleCreate = useCallback(async () => {
    if (selectedEvents.length === 0) { Alert.alert('No Events', 'Please select at least one event to invoice'); return; }
    setIsSubmitting(true);
    try {
      await onCreate({ driverIds: Array.from(selectedDriverIds), eventIds: Array.from(selectedEventIds), dateRange: dateRangeValues });
      onClose();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create invoice');
    } finally { setIsSubmitting(false); }
  }, [selectedDriverIds, selectedEventIds, dateRangeValues, selectedEvents, onCreate, onClose]);

  const handleClose = () => { setStep('drivers'); setSelectedDriverIds(new Set(drivers.map((d) => d.id))); setSelectedEventIds(new Set()); onClose(); };

  const STEPS: InvoiceStep[] = ['drivers', 'events', 'preview'];
  const stepIndex = STEPS.indexOf(step);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.divider }]}>
          <TouchableOpacity onPress={step === 'drivers' ? handleClose : () => setStep('drivers')} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, { color: theme.textSecondary }]}>{step === 'drivers' ? 'Cancel' : 'Back'}</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Create Team Invoice</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.progressContainer}>
          {STEPS.map((s, i) => (
            <View key={s} style={styles.progressStep}>
              <View style={[styles.progressDot, { backgroundColor: step === s ? theme.primary : stepIndex > i ? theme.success : theme.divider }]} />
              <Text style={[styles.progressLabel, { color: step === s ? theme.primary : theme.textSecondary }]}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
            </View>
          ))}
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}><ActivityIndicator size="large" color={theme.primary} /></View>
        ) : (
          <>
            {step === 'drivers' && (
              <TeamInvoiceDriverStep dateRange={dateRange} dateRangeValues={dateRangeValues} onDateRangeChange={setDateRange} drivers={driversWithFilteredEvents} selectedDriverIds={selectedDriverIds} onToggleDriver={toggleDriver} onSelectAll={() => setSelectedDriverIds(new Set(driversWithFilteredEvents.map((d) => d.id)))} onClearSelection={() => setSelectedDriverIds(new Set())} />
            )}
            {step === 'events' && <TeamInvoiceEventStep drivers={selectedDrivers} selectedEventIds={selectedEventIds} onToggleEvent={toggleEvent} />}
            {step === 'preview' && <TeamInvoicePreviewStep dateRangeValues={dateRangeValues} selectedDriverIds={selectedDriverIds} selectedEvents={selectedEvents} totalAmount={totalAmount} drivers={selectedDrivers} selectedEventIds={selectedEventIds} />}

            <View style={[styles.footer, { borderTopColor: theme.divider }]}>
              {step === 'drivers' && (
                <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.primary }, selectedDriverIds.size === 0 && styles.buttonDisabled]} onPress={handleNextToEvents} disabled={selectedDriverIds.size === 0}>
                  <Text style={styles.primaryButtonText}>Continue ({selectedDriverIds.size} drivers)</Text>
                </TouchableOpacity>
              )}
              {step === 'events' && (
                <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.primary }, selectedEventIds.size === 0 && styles.buttonDisabled]} onPress={() => setStep('preview')} disabled={selectedEventIds.size === 0}>
                  <Text style={styles.primaryButtonText}>Preview Invoice ({selectedEventIds.size} events)</Text>
                </TouchableOpacity>
              )}
              {step === 'preview' && (
                <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.success }, isSubmitting && styles.buttonDisabled]} onPress={handleCreate} disabled={isSubmitting}>
                  {isSubmitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.primaryButtonText}>Create Invoice - {formatCurrencyPrecise(totalAmount)}</Text>}
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
}
