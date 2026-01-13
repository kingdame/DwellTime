/**
 * FleetEventsList Styles
 */

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  filterToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  filterToggleText: {
    fontSize: 15,
    fontWeight: '600',
  },
  filterToggleIcon: {
    fontSize: 13,
  },
  filtersContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  filterOptionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  clearFilters: {
    alignItems: 'center',
    paddingTop: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryContainer: {
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 13,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
    color: '#6B7280',
    fontWeight: '700',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
