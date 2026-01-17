/**
 * Location Service
 *
 * Handles geolocation functionality for Momentum app.
 * Provides current location, position watching, and distance calculations.
 */

import { Platform, Alert, PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { permissionsService, PermissionType } from './PermissionsService';

/**
 * Location coordinate interface
 */
export interface Coordinate {
  latitude: number;
  longitude: number;
}

/**
 * Location data interface
 */
export interface LocationData extends Coordinate {
  timestamp: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  fromMockProvider?: boolean;
}

/**
 * Location options interface
 */
export interface LocationOptions {
  accuracy?: {
    android: 'low' | 'balanced' | 'high' | 'veryHigh';
    ios: 'any' | 'navigation' | 'best';
  };
  distanceFilter?: number;
  showLocationDialog?: boolean;
  forceRequestLocation?: boolean;
  forceLocationManager?: boolean;
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  rationale?: {
    title: string;
    message: string;
    buttonPositive: string;
    buttonNegative: string;
    buttonNeutral: string;
  };
}

/**
 * Default location options
 */
const DEFAULT_LOCATION_OPTIONS: LocationOptions = {
  accuracy: {
    android: 'high',
    ios: 'best',
  },
  distanceFilter: 10,
  showLocationDialog: true,
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 10000,
};

/**
 * Distance calculation result
 */
export interface DistanceResult {
  kilometers: number;
  meters: number;
  miles: number;
  nauticalMiles: number;
}

/**
 * Location Service Class
 */
export class LocationService {
  private static instance: LocationService;
  private watchId: number | null = null;
  private currentLocation: LocationData | null = null;
  private locationListeners: Map<string, (location: LocationData) => void> = new Map();

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Check if location service is enabled
   */
  async isLocationEnabled(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        // On Android, check if location provider is enabled
        return await Geolocation.checkLocationProviderEnabled();
      } else {
        // iOS doesn't provide a direct method, assume enabled
        return true;
      }
    } catch (error) {
      console.error('Error checking location service status:', error);
      return false;
    }
  }

  /**
   * Request location permissions
   */
  async requestLocationPermissions(showRationale: boolean = true): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        // For Android, use native permissions API
        const fineLocation = await permissionsService.requestPermission(
          PermissionType.LOCATION,
          showRationale
        );

        if (!fineLocation.granted) {
          return false;
        }

        // On Android 10+ (API 29+), also request background location if needed
        // For now, we'll stick with foreground location
        return true;
      } else {
        // iOS
        const result = await permissionsService.requestPermission(
          PermissionType.LOCATION,
          showRationale
        );

        return result.granted;
      }
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  /**
   * Check location permissions
   */
  async checkLocationPermissions(): Promise<boolean> {
    try {
      const result = await permissionsService.checkPermission(PermissionType.LOCATION);
      return result.granted;
    } catch (error) {
      console.error('Error checking location permissions:', error);
      return false;
    }
  }

  /**
   * Get current location
   */
  async getCurrentPosition(options?: LocationOptions): Promise<LocationData> {
    return new Promise(async (resolve, reject) => {
      try {
        // Check if location service is enabled
        const isEnabled = await this.isLocationEnabled();
        if (!isEnabled) {
          const error = {
            code: 2,
            message: 'Location services are disabled',
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3,
          };
          reject(error);
          return;
        }

        // Check permissions
        const hasPermission = await this.checkLocationPermissions();
        if (!hasPermission) {
          const granted = await this.requestLocationPermissions(true);
          if (!granted) {
            const error = {
              code: 1,
              message: 'Location permission denied',
              PERMISSION_DENIED: 1,
              POSITION_UNAVAILABLE: 2,
              TIMEOUT: 3,
            };
            reject(error);
            return;
          }
        }

        // Get current position
        Geolocation.getCurrentPosition(
          (position) => {
            const locationData: LocationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              timestamp: position.timestamp,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude,
              altitudeAccuracy: position.coords.altitudeAccuracy,
              heading: position.coords.heading,
              speed: position.coords.speed,
              fromMockProvider: position.mocked || false,
            };

            this.currentLocation = locationData;
            resolve(locationData);
          },
          (error) => {
            console.error('Geolocation error:', error);
            reject(error);
          },
          {
            ...DEFAULT_LOCATION_OPTIONS,
            ...options,
          } as any
        );
      } catch (error) {
        console.error('Error getting current position:', error);
        reject(error);
      }
    });
  }

  /**
   * Watch position changes
   */
  async watchPosition(
    callback: (location: LocationData) => void,
    options?: LocationOptions,
    listenerId?: string
  ): Promise<string> {
    try {
      // Check permissions
      const hasPermission = await this.checkLocationPermissions();
      if (!hasPermission) {
        const granted = await this.requestLocationPermissions(true);
        if (!granted) {
          throw new Error('Location permission denied');
        }
      }

      // Generate listener ID if not provided
      const id = listenerId || `listener_${Date.now()}`;

      // Start watching position
      this.watchId = Geolocation.watchPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: position.timestamp,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            fromMockProvider: position.mocked || false,
          };

          this.currentLocation = locationData;
          callback(locationData);

          // Notify all listeners
          this.locationListeners.forEach((listener) => {
            try {
              listener(locationData);
            } catch (error) {
              console.error('Error in location listener:', error);
            }
          });
        },
        (error) => {
          console.error('Geolocation watch error:', error);
        },
        {
          ...DEFAULT_LOCATION_OPTIONS,
          ...options,
        } as any
      );

      // Store listener
      this.locationListeners.set(id, callback);

      return id;
    } catch (error) {
      console.error('Error watching position:', error);
      throw error;
    }
  }

  /**
   * Stop watching position
   */
  clearWatch(listenerId?: string): void {
    if (listenerId) {
      // Remove specific listener
      this.locationListeners.delete(listenerId);
    } else {
      // Clear all listeners
      this.locationListeners.clear();
    }

    // Stop watching if no listeners left
    if (this.locationListeners.size === 0 && this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Get last known location
   */
  getLastKnownLocation(): LocationData | null {
    return this.currentLocation;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  calculateDistance(
    from: Coordinate,
    to: Coordinate,
    unit: 'km' | 'miles' | 'nm' = 'km'
  ): DistanceResult {
    const earthRadius = {
      km: 6371, // kilometers
      miles: 3959, // miles
      nm: 3440, // nautical miles
    };

    const dLat = this.toRadians(to.latitude - from.latitude);
    const dLon = this.toRadians(to.longitude - from.longitude);

    const lat1 = this.toRadians(from.latitude);
    const lat2 = this.toRadians(to.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const kilometers = earthRadius.km * c;
    const meters = kilometers * 1000;
    const miles = earthRadius.miles * c;
    const nauticalMiles = earthRadius.nm * c;

    return {
      kilometers,
      meters,
      miles,
      nauticalMiles,
    };
  }

  /**
   * Check if a coordinate is within a certain radius
   */
  isWithinRadius(
    center: Coordinate,
    point: Coordinate,
    radiusKm: number
  ): boolean {
    const distance = this.calculateDistance(center, point, 'km');
    return distance.kilometers <= radiusKm;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Open location settings
   */
  async openLocationSettings(): Promise<boolean> {
    try {
      await permissionsService.openAppSettings();
      return true;
    } catch (error) {
      console.error('Error opening location settings:', error);
      return false;
    }
  }

  /**
   * Show location permission alert
   */
  private async showLocationPermissionAlert(): Promise<void> {
    return new Promise((resolve) => {
      Alert.alert(
        'Location Permission Required',
        'Momentum needs location access to provide context-aware suggestions based on where you are. Your location data is processed locally and never shared.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(),
          },
          {
            text: 'Settings',
            onPress: async () => {
              await this.openLocationSettings();
              resolve();
            },
          },
        ],
        { cancelable: false }
      );
    });
  }

  /**
   * Get location name from coordinates (reverse geocoding)
   * Note: This would require a geocoding service like Google Maps API
   */
  async getLocationName(coordinate: Coordinate): Promise<string> {
    // TODO: Implement reverse geocoding
    // For now, return coordinates as string
    return `${coordinate.latitude.toFixed(6)}, ${coordinate.longitude.toFixed(6)}`;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.clearWatch();
    this.locationListeners.clear();
    this.currentLocation = null;
  }
}

/**
 * Export singleton instance
 */
export const locationService = LocationService.getInstance();
