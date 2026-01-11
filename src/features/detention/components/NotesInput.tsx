/**
 * NotesInput Component
 * Expandable text area for detention notes with character limit
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Keyboard,
} from 'react-native';

interface NotesInputProps {
  /** Current notes value */
  value: string;
  /** Called when notes change */
  onChange: (notes: string) => void;
  /** Called when input loses focus (for auto-save) */
  onBlur?: () => void;
  /** Maximum character limit */
  maxLength?: number;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether to start expanded */
  initiallyExpanded?: boolean;
}

export function NotesInput({
  value,
  onChange,
  onBlur,
  maxLength = 500,
  placeholder = 'Add notes about this detention...',
  disabled = false,
  initiallyExpanded = false,
}: NotesInputProps) {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded || value.length > 0);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const heightAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  const remainingChars = maxLength - value.length;
  const isNearLimit = remainingChars <= 50;
  const isAtLimit = remainingChars <= 0;

  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isExpanded, heightAnim]);

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Collapse if empty
    if (value.length === 0) {
      setIsExpanded(false);
    }
    onBlur?.();
  };

  const handleChange = (text: string) => {
    // Enforce max length
    if (text.length <= maxLength) {
      onChange(text);
    }
  };

  const animatedHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [48, 140],
  });

  if (!isExpanded) {
    return (
      <TouchableOpacity
        style={styles.collapsedContainer}
        onPress={handleExpand}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={styles.collapsedIcon}>📝</Text>
        <Text style={styles.collapsedText}>{placeholder}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        isFocused && styles.containerFocused,
        disabled && styles.containerDisabled,
        { height: animatedHeight },
      ]}
    >
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor="#8E8E93"
        multiline
        maxLength={maxLength}
        editable={!disabled}
        textAlignVertical="top"
        returnKeyType="default"
        blurOnSubmit={false}
      />

      {/* Character counter */}
      <View style={styles.footer}>
        <Text
          style={[
            styles.charCount,
            isNearLimit && styles.charCountWarning,
            isAtLimit && styles.charCountError,
          ]}
        >
          {value.length}/{maxLength}
        </Text>
        {isFocused && (
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => Keyboard.dismiss()}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

/**
 * Compact notes display (read-only)
 */
export function NotesDisplay({
  notes,
  onPress,
}: {
  notes: string;
  onPress?: () => void;
}) {
  if (!notes) {
    return (
      <TouchableOpacity style={styles.displayEmpty} onPress={onPress}>
        <Text style={styles.displayEmptyText}>+ Add Notes</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.displayContainer}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={styles.displayLabel}>Notes</Text>
      <Text style={styles.displayText} numberOfLines={3}>
        {notes}
      </Text>
    </TouchableOpacity>
  );
}

/**
 * Inline notes preview with edit icon
 */
export function NotesPreview({
  notes,
  onEdit,
}: {
  notes: string;
  onEdit?: () => void;
}) {
  return (
    <View style={styles.previewContainer}>
      <View style={styles.previewHeader}>
        <Text style={styles.previewIcon}>📝</Text>
        <Text style={styles.previewLabel}>Notes</Text>
        {onEdit && (
          <TouchableOpacity onPress={onEdit}>
            <Text style={styles.editLink}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
      {notes ? (
        <Text style={styles.previewText}>{notes}</Text>
      ) : (
        <Text style={styles.previewEmpty}>No notes added</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Collapsed state
  collapsedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#38383A',
    borderStyle: 'dashed',
  },
  collapsedIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  collapsedText: {
    color: '#8E8E93',
    fontSize: 15,
  },

  // Expanded state
  container: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#38383A',
    overflow: 'hidden',
  },
  containerFocused: {
    borderColor: '#007AFF',
  },
  containerDisabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    padding: 14,
    paddingBottom: 30,
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#2C2C2E',
  },
  charCount: {
    fontSize: 12,
    color: '#8E8E93',
  },
  charCountWarning: {
    color: '#FF9500',
  },
  charCountError: {
    color: '#FF3B30',
  },
  doneButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  doneButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Display (read-only)
  displayContainer: {
    padding: 14,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
  },
  displayLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  displayText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
  },
  displayEmpty: {
    padding: 14,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#38383A',
    borderStyle: 'dashed',
  },
  displayEmptyText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Preview
  previewContainer: {
    padding: 14,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  previewLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editLink: {
    color: '#007AFF',
    fontSize: 14,
  },
  previewText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  previewEmpty: {
    color: '#8E8E93',
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default NotesInput;
