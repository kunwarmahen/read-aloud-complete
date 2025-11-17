import { Audio } from 'expo-av';

let sound = null;

export const setupAudio = async () => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });
  } catch (error) {
    console.error('Error setting up audio:', error);
  }
};

export const loadAudio = async (uri, onPlaybackStatusUpdate) => {
  try {
    // Unload previous sound if exists
    if (sound) {
      await sound.unloadAsync();
    }

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: false },
      onPlaybackStatusUpdate
    );

    sound = newSound;
    return sound;
  } catch (error) {
    console.error('Error loading audio:', error);
    throw error;
  }
};

export const playAudio = async () => {
  try {
    if (sound) {
      await sound.playAsync();
    }
  } catch (error) {
    console.error('Error playing audio:', error);
  }
};

export const pauseAudio = async () => {
  try {
    if (sound) {
      await sound.pauseAsync();
    }
  } catch (error) {
    console.error('Error pausing audio:', error);
  }
};

export const stopAudio = async () => {
  try {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      sound = null;
    }
  } catch (error) {
    console.error('Error stopping audio:', error);
  }
};

export const seekAudio = async (positionMillis) => {
  try {
    if (sound) {
      await sound.setPositionAsync(positionMillis);
    }
  } catch (error) {
    console.error('Error seeking audio:', error);
  }
};

export const getAudioStatus = async () => {
  try {
    if (sound) {
      return await sound.getStatusAsync();
    }
    return null;
  } catch (error) {
    console.error('Error getting audio status:', error);
    return null;
  }
};
