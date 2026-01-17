/**
 * AddFacilityForm Component
 * Form for adding a new facility with Google Places Autocomplete
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors } from '@/constants/colors';
import { useCreateFacility } from '../hooks/useFacilitiesConvex';
import { PlacesAutocomplete } from '@/shared/components/PlacesAutocomplete';
import { isGoogleMapsConfigured, type ParsedAddress } from '@/shared/lib/googleMaps';
import type { Facility } from '@/shared/types';

// Local type for create input
interface FacilityCreateInput {
  name: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  lat: number;
  lng: number;
  facilityType: 'shipper' | 'receiver' | 'both' | 'unknown';
}

interface AddFacilityFormProps {
  currentLocation?: { lat: number; lng: number } | null;
  onSuccess: (facility: Facility) => void;
  onCancel: () => void;
}

type FacilityType = Facility['facility_type'];

const FACILITY_TYPES: { value: FacilityType; label: string }[] = [
  { value: 'shipper', label: 'Shipper' },
  { value: 'receiver', label: 'Receiver' },
  { value: 'both', label: 'Both' },
  { value: 'unknown', label: 'Unknown' },
];

export function AddFacilityForm({
  currentLocation,
  onSuccess,
  onCancel,
}: AddFacilityFormProps) {
  const theme = colors.dark;
  const createFacility = useCreateFacility();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [facilityType, setFacilityType] = useState<FacilityType>('receiver');
  const [useCurrentLocation, setUseCurrentLocation] = useState(!!currentLocation);
  const [showManualEntry, setShowManualEntry] = useState(!isGoogleMapsConfigured());

  // Handle address selection from Google Places
  const handleAddressSelect = useCallback((parsedAddress: ParsedAddress) => {
    // Use place name if no name entered yet
    if (!name.trim() && parsedAddress.name) {
      setName(parsedAddress.name);
    }
    
    // Build street address
    const streetAddress = [parsedAddress.streetNumber, parsedAddress.street]
      .filter(Boolean)
      .join(' ');
    
    setAddress(streetAddress || parsedAddress.formattedAddress);
    setCity(parsedAddress.city || '');
    setState(parsedAddress.state || '');
    setZip(parsedAddress.zip || '');
    setLat(parsedAddress.lat);
    setLng(parsedAddress.lng);
    
    // Turn off "use current location" since we have coordinates from the place
    if (parsedAddress.lat && parsedAddress.lng) {
      setUseCurrentLocation(false);
    }
  }, [name]);

  const hasCoordinates = (lat !== null && lng !== null) || (useCurrentLocation && currentLocation);
  const isValid = name.trim().length >= 2 && hasCoordinates;

  const handleSubmit = useCallback(async () => {
    if (!isValid) {
      Alert.alert('Invalid Form', 'Please enter a facility name and provide a location (search for address or use current location)');
      return;
    }

    // Determine coordinates
    let finalLat = 0;
    let finalLng = 0;
    
    if (lat !== null && lng !== null) {
      finalLat = lat;
      finalLng = lng;
    } else if (useCurrentLocation && currentLocation) {
      finalLat = currentLocation.lat;
      finalLng = currentLocation.lng;
    }

    const input: FacilityCreateInput = {
      name: name.trim(),
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      state: state.trim() || undefined,
      zip: zip.trim() || undefined,
      lat: finalLat,
      lng: finalLng,
      facilityType: facilityType,
    };

    try {
      const newFacility = await createFacility.mutateAsync(input);
      onSuccess(newFacility);
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create facility'
      );
    }
  }, [isValid, useCurrentLocation, currentLocation, name, address, city, state, zip, lat, lng, facilityType, createFacility, onSuccess]);

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        Add New Facility
      </Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        This facility will be saved and available for future visits
      </Text>

      {/* Facility Name */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          Facility Name *
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.card, color: theme.textPrimary }]}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Acme Distribution Center"
          placeholderTextColor={theme.textDisabled}
          autoCapitalize="words"
        />
      </View>

      {/* Google Places Autocomplete */}
      {isGoogleMapsConfigured() && !showManualEntry && (
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Search Address
          </Text>
          <PlacesAutocomplete
            placeholder="Search for address or business..."
            onSelect={handleAddressSelect}
            currentLocation={currentLocation}
            onClear={() => {
              setAddress('');
              setCity('');
              setState('');
              setZip('');
              setLat(null);
              setLng(null);
            }}
          />
          <TouchableOpacity
            style={styles.toggleManual}
            onPress={() => setShowManualEntry(true)}
          >
            <Text style={[styles.toggleManualText, { color: theme.primary }]}>
              Enter address manually instead
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Manual Entry Toggle (when using autocomplete) */}
      {isGoogleMapsConfigured() && showManualEntry && (
        <TouchableOpacity
          style={styles.toggleManual}
          onPress={() => setShowManualEntry(false)}
        >
          <Text style={[styles.toggleManualText, { color: theme.primary }]}>
            ← Search for address instead
          </Text>
        </TouchableOpacity>
      )}

      {/* Manual Address Entry (shown if no Google Maps or user prefers) */}
      {(showManualEntry || !isGoogleMapsConfigured()) && (
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Street Address
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.textPrimary }]}
            value={address}
            onChangeText={setAddress}
            placeholder="123 Warehouse Blvd"
            placeholderTextColor={theme.textDisabled}
          />
        </View>
      )}

      {/* City, State, Zip Row - shown in manual mode OR when filled from autocomplete */}
      {(showManualEntry || !isGoogleMapsConfigured() || city || state || zip) && (
        <View style={styles.row}>
          <View style={[styles.field, { flex: 2 }]}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>City</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.textPrimary }]}
              value={city}
              onChangeText={setCity}
              placeholder="City"
              placeholderTextColor={theme.textDisabled}
              editable={showManualEntry || !isGoogleMapsConfigured()}
            />
          </View>
          <View style={[styles.field, { flex: 1, marginLeft: 12 }]}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>State</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.textPrimary }]}
              value={state}
              onChangeText={setState}
              placeholder="CA"
              placeholderTextColor={theme.textDisabled}
              maxLength={2}
              autoCapitalize="characters"
              editable={showManualEntry || !isGoogleMapsConfigured()}
            />
          </View>
          <View style={[styles.field, { flex: 1, marginLeft: 12 }]}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Zip</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.textPrimary }]}
              value={zip}
              onChangeText={setZip}
              placeholder="12345"
              placeholderTextColor={theme.textDisabled}
              keyboardType="number-pad"
              maxLength={5}
              editable={showManualEntry || !isGoogleMapsConfigured()}
            />
          </View>
        </View>
      )}

      {/* Facility Type */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          Facility Type
        </Text>
        <View style={styles.typeButtons}>
          {FACILITY_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeButton,
                { backgroundColor: theme.card },
                facilityType === type.value && {
                  backgroundColor: theme.primary,
                  borderColor: theme.primary,
                },
              ]}
              onPress={() => setFacilityType(type.value)}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  { color: theme.textSecondary },
                  facilityType === type.value && { color: '#fff' },
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Location Status */}
      <View style={styles.field}>
        {/* Show coordinates from Places search */}
        {lat !== null && lng !== null && !useCurrentLocation && (
          <View style={[styles.locationToggle, { backgroundColor: theme.success + '20' }]}>
            <Text style={styles.checkmark}>✓</Text>
            <View style={styles.locationToggleText}>
              <Text style={[styles.locationLabel, { color: theme.success }]}>
                Location from address search
              </Text>
              <Text style={[styles.locationCoords, { color: theme.textSecondary }]}>
                {lat.toFixed(6)}, {lng.toFixed(6)}
              </Text>
            </View>
          </View>
        )}

        {/* Current location toggle - show when no Places coordinates */}
        {(lat === null || lng === null || showManualEntry) && (
          <TouchableOpacity
            style={[styles.locationToggle, { backgroundColor: theme.card }]}
            onPress={() => setUseCurrentLocation(!useCurrentLocation)}
            disabled={!currentLocation}
          >
            <View style={styles.checkbox}>
              {useCurrentLocation && currentLocation && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
            <View style={styles.locationToggleText}>
              <Text style={[styles.locationLabel, { color: theme.textPrimary }]}>
                Use Current Location
              </Text>
              {currentLocation ? (
                <Text style={[styles.locationCoords, { color: theme.textSecondary }]}>
                  {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                </Text>
              ) : (
                <Text style={[styles.locationCoords, { color: theme.error }]}>
                  Location not available
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton, { borderColor: theme.divider }]}
          onPress={onCancel}
        >
          <Text style={[styles.buttonText, { color: theme.textSecondary }]}>
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.submitButton,
            { backgroundColor: theme.primary },
            (!isValid || createFacility.isPending) && styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!isValid || createFacility.isPending}
        >
          {createFacility.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={[styles.buttonText, { color: '#fff' }]}>
              Add Facility
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  locationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkmark: {
    color: '#22C55E',
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationToggleText: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  locationCoords: {
    fontSize: 12,
    marginTop: 2,
  },
  toggleManual: {
    marginTop: 12,
    paddingVertical: 8,
  },
  toggleManualText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  submitButton: {},
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
