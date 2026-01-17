/**
 * Audio Recorder Service
 *
 * Handles audio recording and playback for Momentum app.
 * Provides voice recording functionality for meeting notes and voice commands.
 */

import { Platform, Alert } from 'react-native';
import AudioRecorderPlayer, {
  AudioSet,
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioFormatAndroidType,
  AudioSourceAndroidType,
} from 'react-native-audio-recorder-player';
import { permissionsService, PermissionType } from './PermissionsService';

/**
 * Recording state
 */
export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

/**
 * Playback state
 */
export type PlaybackState = 'idle' | 'playing' | 'paused' | 'stopped';

/**
 * Recording metadata interface
 */
export interface RecordingMetadata {
  path: string;
  duration: number;
  fileSize?: number;
  createdAt: Date;
}

/**
 * Recording options interface
 */
export interface RecordingOptions {
  sampleRate?: number;
  channels?: number;
  audioEncodingBitRate?: number;
  audioEncodingBitRateAndroid?: number;
  outputFormatAndroid?: AudioFormatAndroidType;
  audioEncoderAndroid?: AudioEncoderAndroidType;
  audioSourceAndroid?: AudioSourceAndroidType;
  avsQuality?: AVEncoderAudioQualityIOSType;
  avEncodingOption?: AVEncodingOption;
  meteringEnabled?: boolean;
  includeBase64?: boolean;
}

/**
 * Default recording options
 */
const DEFAULT_RECORDING_OPTIONS: RecordingOptions = {
  sampleRate: 44100,
  channels: 2,
  audioEncodingBitRate: 128000,
  audioEncodingBitRateAndroid: 128000,
  outputFormatAndroid: AudioFormatAndroidType.AAC_ADTS,
  audioEncoderAndroid: AudioEncoderAndroidType.AAC,
  audioSourceAndroid: AudioSourceAndroidType.MIC,
  avsQuality: AVEncoderAudioQualityIOSType.high,
  avEncodingOption: AVEncodingOption.aac,
  meteringEnabled: true,
  includeBase64: false,
};

/**
 * Recording progress callback
 */
export interface RecordingProgress {
  currentPosition: number;
  currentDuration: number;
  isRecording?: boolean;
}

/**
 * Playback progress callback
 */
export interface PlaybackProgress {
  currentPosition: number;
  currentDuration: number;
  isPlaying?: boolean;
}

/**
 * Audio Recorder Service Class
 */
export class AudioRecorderService {
  private static instance: AudioRecorderService;
  private audioRecorderPlayer: AudioRecorderPlayer;
  private recordingState: RecordingState = 'idle';
  private playbackState: PlaybackState = 'idle';
  private currentRecordingPath: string | null = null;
  private currentPlaybackPath: string | null = null;
  private recordingStartTime: number = 0;
  private playbackDuration: number = 0;

  private constructor() {
    this.audioRecorderPlayer = new AudioRecorderPlayer();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): AudioRecorderService {
    if (!AudioRecorderService.instance) {
      AudioRecorderService.instance = new AudioRecorderService();
    }
    return AudioRecorderService.instance;
  }

  /**
   * Initialize audio recorder service
   */
  async initialize(): Promise<boolean> {
    try {
      // Initialize audio recorder player
      await this.audioRecorderPlayer.setSubscriptionDuration(0.1);
      return true;
    } catch (error) {
      console.error('Failed to initialize AudioRecorderService:', error);
      return false;
    }
  }

  /**
   * Request microphone permissions
   */
  async requestMicrophonePermission(showRationale: boolean = true): Promise<boolean> {
    try {
      const result = await permissionsService.requestPermission(
        PermissionType.MICROPHONE,
        showRationale
      );

      return result.granted;
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      return false;
    }
  }

  /**
   * Check microphone permissions
   */
  async checkMicrophonePermission(): Promise<boolean> {
    try {
      const result = await permissionsService.checkPermission(PermissionType.MICROPHONE);
      return result.granted;
    } catch (error) {
      console.error('Error checking microphone permission:', error);
      return false;
    }
  }

  /**
   * Start recording
   */
  async startRecording(
    path?: string,
    options?: RecordingOptions
  ): Promise<string> {
    try {
      // Check if already recording
      if (this.recordingState === 'recording') {
        throw new Error('Already recording');
      }

      // Check permissions
      const hasPermission = await this.checkMicrophonePermission();
      if (!hasPermission) {
        const granted = await this.requestMicrophonePermission(true);
        if (!granted) {
          throw new Error('Microphone permission denied');
        }
      }

      // Generate path if not provided
      const recordingPath =
        path ||
        `sound_${Date.now()}.${this.getFileExtension()}`;

      // Build audio set
      const audioSet: AudioSet = {
        AVSampleRateKey: (options?.sampleRate || DEFAULT_RECORDING_OPTIONS.sampleRate).toString(),
        AVNumberOfChannelsKey: (options?.channels || DEFAULT_RECORDING_OPTIONS.channels).toString(),
        AVFormatIDKeyIOS: options?.avEncodingOption || DEFAULT_RECORDING_OPTIONS.avEncodingOption,
        AVEncoderAudioQualityKeyIOS:
          options?.avsQuality || DEFAULT_RECORDING_OPTIONS.avsQuality,
        AudioEncoderAndroid:
          options?.audioEncoderAndroid || DEFAULT_RECORDING_OPTIONS.audioEncoderAndroid,
        AudioFormatAndroid:
          options?.outputFormatAndroid || DEFAULT_RECORDING_OPTIONS.outputFormatAndroid,
        AudioSourceAndroid:
          options?.audioSourceAndroid || DEFAULT_RECORDING_OPTIONS.audioSourceAndroid,
        AudioEncodingBitRateAndroid:
          options?.audioEncodingBitRateAndroid ||
          DEFAULT_RECORDING_OPTIONS.audioEncodingBitRateAndroid,
      };

      // Start recording
      const result = await this.audioRecorderPlayer.startRecorder(
        recordingPath,
        audioSet
      );

      // Update state
      this.recordingState = 'recording';
      this.currentRecordingPath = recordingPath;
      this.recordingStartTime = Date.now();

      return result;
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording
   */
  async stopRecording(): Promise<RecordingMetadata> {
    try {
      if (this.recordingState !== 'recording' && this.recordingState !== 'paused') {
        throw new Error('Not recording');
      }

      // Stop recording
      const result = await this.audioRecorderPlayer.stopRecorder();

      // Calculate duration
      const duration = Date.now() - this.recordingStartTime;

      const metadata: RecordingMetadata = {
        path: result || this.currentRecordingPath || '',
        duration,
        createdAt: new Date(),
      };

      // Reset state
      this.recordingState = 'stopped';
      this.currentRecordingPath = null;
      this.recordingStartTime = 0;

      return metadata;
    } catch (error) {
      console.error('Error stopping recording:', error);
      throw error;
    }
  }

  /**
   * Pause recording
   */
  async pauseRecording(): Promise<void> {
    try {
      if (this.recordingState !== 'recording') {
        throw new Error('Not recording');
      }

      await this.audioRecorderPlayer.pauseRecorder();
      this.recordingState = 'paused';
    } catch (error) {
      console.error('Error pausing recording:', error);
      throw error;
    }
  }

  /**
   * Resume recording
   */
  async resumeRecording(): Promise<void> {
    try {
      if (this.recordingState !== 'paused') {
        throw new Error('Recording not paused');
      }

      await this.audioRecorderPlayer.resumeRecorder();
      this.recordingState = 'recording';
    } catch (error) {
      console.error('Error resuming recording:', error);
      throw error;
    }
  }

  /**
   * Start playback
   */
  async startPlayback(path: string): Promise<void> {
    try {
      // Check if already playing
      if (this.playbackState === 'playing') {
        await this.stopPlayback();
      }

      // Start playback
      await this.audioRecorderPlayer.startPlayer(path);

      // Update state
      this.playbackState = 'playing';
      this.currentPlaybackPath = path;
    } catch (error) {
      console.error('Error starting playback:', error);
      throw error;
    }
  }

  /**
   * Stop playback
   */
  async stopPlayback(): Promise<void> {
    try {
      if (this.playbackState !== 'playing' && this.playbackState !== 'paused') {
        return;
      }

      await this.audioRecorderPlayer.stopPlayer();
      this.audioRecorderPlayer.stopPlay();

      // Reset state
      this.playbackState = 'stopped';
      this.currentPlaybackPath = null;
      this.playbackDuration = 0;
    } catch (error) {
      console.error('Error stopping playback:', error);
      throw error;
    }
  }

  /**
   * Pause playback
   */
  async pausePlayback(): Promise<void> {
    try {
      if (this.playbackState !== 'playing') {
        throw new Error('Not playing');
      }

      await this.audioRecorderPlayer.pausePlayer();
      this.playbackState = 'paused';
    } catch (error) {
      console.error('Error pausing playback:', error);
      throw error;
    }
  }

  /**
   * Resume playback
   */
  async resumePlayback(): Promise<void> {
    try {
      if (this.playbackState !== 'paused') {
        throw new Error('Playback not paused');
      }

      await this.audioRecorderPlayer.resumePlayer();
      this.playbackState = 'playing';
    } catch (error) {
      console.error('Error resuming playback:', error);
      throw error;
    }
  }

  /**
   * Seek to position in playback
   */
  async seekToPlayer(seconds: number): Promise<void> {
    try {
      await this.audioRecorderPlayer.seekToPlayer(seconds);
    } catch (error) {
      console.error('Error seeking playback:', error);
      throw error;
    }
  }

  /**
   * Set volume
   */
  async setVolume(volume: number): Promise<void> {
    try {
      if (volume < 0 || volume > 1) {
        throw new Error('Volume must be between 0 and 1');
      }

      await this.audioRecorderPlayer.setVolume(volume);
    } catch (error) {
      console.error('Error setting volume:', error);
      throw error;
    }
  }

  /**
   * Subscribe to recording progress
   */
  onRecordingProgress(callback: (progress: RecordingProgress) => void): void {
    this.audioRecorderPlayer.addRecordBackListener((e) => {
      callback({
        currentPosition: e.currentPosition,
        currentDuration: e.currentDuration,
        isRecording: this.recordingState === 'recording',
      });
    });
  }

  /**
   * Subscribe to playback progress
   */
  onPlaybackProgress(callback: (progress: PlaybackProgress) => void): void {
    this.audioRecorderPlayer.addPlayBackListener((e) => {
      callback({
        currentPosition: e.currentPosition,
        currentDuration: e.currentDuration,
        isPlaying: this.playbackState === 'playing',
      });
    });
  }

  /**
   * Unsubscribe from recording progress
   */
  removeRecordBackListener(): void {
    this.audioRecorderPlayer.removeRecordBackListener();
  }

  /**
   * Unsubscribe from playback progress
   */
  removePlayBackListener(): void {
    this.audioRecorderPlayer.removePlayBackListener();
  }

  /**
   * Get recording state
   */
  getRecordingState(): RecordingState {
    return this.recordingState;
  }

  /**
   * Get playback state
   */
  getPlaybackState(): PlaybackState {
    return this.playbackState;
  }

  /**
   * Get current recording path
   */
  getCurrentRecordingPath(): string | null {
    return this.currentRecordingPath;
  }

  /**
   * Get current playback path
   */
  getCurrentPlaybackPath(): string | null {
    return this.currentPlaybackPath;
  }

  /**
   * Format duration to human-readable string
   */
  formatDuration(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Get file extension based on platform
   */
  private getFileExtension(): string {
    return Platform.OS === 'ios' ? 'm4a' : 'mp4';
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      // Stop recording if active
      if (this.recordingState === 'recording') {
        await this.stopRecording();
      }

      // Stop playback if active
      if (this.playbackState === 'playing' || this.playbackState === 'paused') {
        await this.stopPlayback();
      }

      // Remove listeners
      this.audioRecorderPlayer.removeRecordBackListener();
      this.audioRecorderPlayer.removePlayBackListener();

      // Reset state
      this.recordingState = 'idle';
      this.playbackState = 'idle';
      this.currentRecordingPath = null;
      this.currentPlaybackPath = null;
      this.recordingStartTime = 0;
      this.playbackDuration = 0;
    } catch (error) {
      console.error('Error cleaning up AudioRecorderService:', error);
    }
  }

  /**
   * Show microphone permission alert
   */
  private async showMicrophonePermissionAlert(): Promise<void> {
    return new Promise((resolve) => {
      Alert.alert(
        'Microphone Access Required',
        'Momentum needs microphone access to record voice notes and meeting transcripts. Audio is processed locally and never shared without your consent.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(),
          },
          {
            text: 'Settings',
            onPress: async () => {
              await permissionsService.openAppSettings();
              resolve();
            },
          },
        ],
        { cancelable: false }
      );
    });
  }

  /**
   * Record with automatic stop after duration
   */
  async recordWithDuration(
    durationSeconds: number,
    options?: RecordingOptions
  ): Promise<RecordingMetadata> {
    try {
      await this.startRecording(undefined, options);

      // Wait for specified duration
      await new Promise((resolve) => setTimeout(resolve, durationSeconds * 1000));

      return await this.stopRecording();
    } catch (error) {
      console.error('Error recording with duration:', error);
      throw error;
    }
  }

  /**
   * Quick record helper (records for 30 seconds)
   */
  async quickRecord(options?: RecordingOptions): Promise<RecordingMetadata> {
    return this.recordWithDuration(30, options);
  }
}

/**
 * Export singleton instance
 */
export const audioRecorderService = AudioRecorderService.getInstance();
