/**
 * PlacesAutocomplete Component
 * 
 * Google Places Autocomplete input for address/facility search
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Keyboard,
} from 'react-native';
import { colors } from '@/constants/colors';
import {
  searchPlaces,
  getPlaceDetails,
  isGoogleMapsConfigured,
  type PlacePrediction,
  type ParsedAddress,
} from '@/shared/lib/googleMaps';

interface PlacesAutocompleteProps {
  placeholder?: string;
  onSelect: (address: ParsedAddress) => void;
  onClear?: () => void;
  initialValue?: string;
  currentLocation?: { lat: number; lng: number } | null;
  autoFocus?: boolean;
}

export function PlacesAutocomplete({
  placeholder = 'Search address or facility...',
  onSelect,
  onClear,
  initialValue = '',
  currentLocation,
  autoFocus = false,
}: PlacesAutocompleteProps) {
  const theme = colors.dark;
  const [query, setQuery] = useState(initialValue);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<ParsedAddress | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<TextInput>(null);

  const isConfigured = isGoogleMapsConfigured();

  // Debounced search
  const handleSearch = useCallback(
    (text: string) => {
      setQuery(text);
      setSelectedAddress(null);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (!text.trim() || text.length < 2) {
        setPredictions([]);
        setShowResults(false);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        setIsLoading(true);
        try {
          const results = await searchPlaces(text, {
            location: currentLocation || undefined,
          });
          setPredictions(results);
          setShowResults(results.length > 0);
        } catch (error) {
          console.error('Search error:', error);
          setPredictions([]);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    },
    [currentLocation]
  );

  // Handle place selection
  const handleSelect = useCallback(
    async (prediction: PlacePrediction) => {
      setIsLoading(true);
      setShowResults(false);
      Keyboard.dismiss();

      try {
        const details = await getPlaceDetails(prediction.place_id);
        if (details) {
          setQuery(prediction.structured_formatting.main_text);
          setSelectedAddress(details);
          onSelect(details);
        }
      } catch (error) {
        console.error('Failed to get place details:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [onSelect]
  );

  // Clear input
  const handleClear = useCallback(() => {
    setQuery('');
    setPredictions([]);
    setShowResults(false);
    setSelectedAddress(null);
    onClear?.();
    inputRef.current?.focus();
  }, [onClear]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Warning if not configured
  if (!isConfigured) {
    return (
      <View style={[styles.container, { backgroundColor: theme.card }]}>
        <View style={styles.inputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.input, { color: theme.textPrimary }]}
            placeholder={placeholder}
            placeholderTextColor={theme.textDisabled}
            editable={false}
          />
        </View>
        <Text style={[styles.warningText, { color: theme.warning }]}>
          Google Maps not configured
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Input */}
      <View style={[styles.inputContainer, { backgroundColor: theme.card }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: theme.textPrimary }]}
          value={query}
          onChangeText={handleSearch}
          placeholder={placeholder}
          placeholderTextColor={theme.textDisabled}
          autoFocus={autoFocus}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="search"
          onFocus={() => query.length >= 2 && setShowResults(predictions.length > 0)}
        />
        {isLoading && (
          <ActivityIndicator size="small" color={theme.primary} style={styles.loader} />
        )}
        {query.length > 0 && !isLoading && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={[styles.clearIcon, { color: theme.textDisabled }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Selected address indicator */}
      {selectedAddress && (
        <View style={[styles.selectedBadge, { backgroundColor: theme.success + '20' }]}>
          <Text style={[styles.selectedText, { color: theme.success }]}>
            ✓ {selectedAddress.formattedAddress}
          </Text>
        </View>
      )}

      {/* Results dropdown */}
      {showResults && predictions.length > 0 && (
        <View style={[styles.resultsContainer, { backgroundColor: theme.card }]}>
          <FlatList
            data={predictions}
            keyExtractor={(item) => item.place_id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.resultIcon}>📍</Text>
                <View style={styles.resultText}>
                  <Text
                    style={[styles.resultMain, { color: theme.textPrimary }]}
                    numberOfLines={1}
                  >
                    {item.structured_formatting.main_text}
                  </Text>
                  <Text
                    style={[styles.resultSecondary, { color: theme.textSecondary }]}
                    numberOfLines={1}
                  >
                    {item.structured_formatting.secondary_text}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => (
              <View style={[styles.separator, { backgroundColor: theme.divider }]} />
            )}
          />
          <View style={[styles.poweredBy, { borderTopColor: theme.divider }]}>
            <Text style={[styles.poweredByText, { color: theme.textDisabled }]}>
              Powered by Google
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 100,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  loader: {
    marginLeft: 8,
  },
  clearButton: {
    padding: 8,
    marginRight: -8,
  },
  clearIcon: {
    fontSize: 16,
  },
  warningText: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  selectedBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectedText: {
    fontSize: 13,
  },
  resultsContainer: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    borderRadius: 12,
    maxHeight: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 999,
    zIndex: 9999,
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  resultIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  resultText: {
    flex: 1,
  },
  resultMain: {
    fontSize: 15,
    fontWeight: '500',
  },
  resultSecondary: {
    fontSize: 13,
    marginTop: 2,
  },
  separator: {
    height: 1,
    marginLeft: 44,
  },
  poweredBy: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  poweredByText: {
    fontSize: 11,
  },
});
