/**
 * CategorySelector Component
 * Allows user to select photo category (Dock, BOL, Conditions, Check-in, Other)
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
} from 'react-native';

import { type PhotoCategory } from '../services/photoService';

interface CategoryOption {
  value: PhotoCategory;
  label: string;
  description: string;
  emoji: string;
}

const CATEGORIES: CategoryOption[] = [
  {
    value: 'dock',
    label: 'Dock',
    description: 'Dock door, loading area, or bay number',
    emoji: '🚛',
  },
  {
    value: 'bol',
    label: 'Bill of Lading',
    description: 'BOL document, delivery receipt, or paperwork',
    emoji: '📄',
  },
  {
    value: 'conditions',
    label: 'Conditions',
    description: 'Weather, traffic, facility issues, damage',
    emoji: '⚠️',
  },
  {
    value: 'checkin',
    label: 'Check-in',
    description: 'Guard shack, check-in kiosk, or arrival proof',
    emoji: '✅',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Any other relevant evidence',
    emoji: '📷',
  },
];

interface CategorySelectorProps {
  /** Currently selected category */
  selectedCategory: PhotoCategory;
  /** Called when category is selected */
  onSelect: (category: PhotoCategory) => void;
  /** Display mode */
  mode?: 'buttons' | 'modal';
  /** Whether the modal is visible (for modal mode) */
  visible?: boolean;
  /** Called when modal should close */
  onClose?: () => void;
}

/**
 * Inline button selector for quick category selection
 */
function CategoryButtons({
  selectedCategory,
  onSelect,
}: {
  selectedCategory: PhotoCategory;
  onSelect: (category: PhotoCategory) => void;
}) {
  return (
    <View style={styles.buttonsContainer}>
      {CATEGORIES.map((cat) => (
        <TouchableOpacity
          key={cat.value}
          style={[
            styles.categoryButton,
            selectedCategory === cat.value && styles.selectedButton,
          ]}
          onPress={() => onSelect(cat.value)}
        >
          <Text style={styles.buttonEmoji}>{cat.emoji}</Text>
          <Text
            style={[
              styles.buttonLabel,
              selectedCategory === cat.value && styles.selectedLabel,
            ]}
          >
            {cat.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

/**
 * Full-screen modal selector with descriptions
 */
function CategoryModal({
  selectedCategory,
  onSelect,
  visible,
  onClose,
}: {
  selectedCategory: PhotoCategory;
  onSelect: (category: PhotoCategory) => void;
  visible: boolean;
  onClose: () => void;
}) {
  const handleSelect = (category: PhotoCategory) => {
    onSelect(category);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select Category</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.optionsContainer}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={[
                styles.optionRow,
                selectedCategory === cat.value && styles.selectedOption,
              ]}
              onPress={() => handleSelect(cat.value)}
            >
              <Text style={styles.optionEmoji}>{cat.emoji}</Text>
              <View style={styles.optionContent}>
                <Text style={styles.optionLabel}>{cat.label}</Text>
                <Text style={styles.optionDescription}>{cat.description}</Text>
              </View>
              {selectedCategory === cat.value && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

export function CategorySelector({
  selectedCategory,
  onSelect,
  mode = 'buttons',
  visible = false,
  onClose,
}: CategorySelectorProps) {
  if (mode === 'modal') {
    return (
      <CategoryModal
        selectedCategory={selectedCategory}
        onSelect={onSelect}
        visible={visible}
        onClose={onClose || (() => {})}
      />
    );
  }

  return (
    <CategoryButtons selectedCategory={selectedCategory} onSelect={onSelect} />
  );
}

/**
 * Quick category pill for showing current selection
 */
export function CategoryPill({
  category,
  onPress,
}: {
  category: PhotoCategory;
  onPress?: () => void;
}) {
  const cat = CATEGORIES.find((c) => c.value === category) || CATEGORIES[4];

  return (
    <TouchableOpacity
      style={styles.pillContainer}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={styles.pillEmoji}>{cat.emoji}</Text>
      <Text style={styles.pillLabel}>{cat.label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Inline buttons
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedButton: {
    backgroundColor: '#007AFF20',
    borderColor: '#007AFF',
  },
  buttonEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  selectedLabel: {
    color: '#007AFF',
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#38383A',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#007AFF',
    fontSize: 17,
  },
  optionsContainer: {
    padding: 16,
    gap: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF15',
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: 14,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    color: '#8E8E93',
  },
  checkmark: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '700',
  },

  // Pill
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#007AFF',
    borderRadius: 12,
  },
  pillEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  pillLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default CategorySelector;
