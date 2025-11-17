import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { articlesAPI, API_URL } from "../api/client";
import {
  setupAudio,
  loadAudio,
  playAudio,
  pauseAudio,
  seekAudio,
  stopAudio,
} from "../services/audioService";

const { width } = Dimensions.get("window");

const PlayerScreen = ({ route, navigation }) => {
  const { article, collectionName } = route.params;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showText, setShowText] = useState(true);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    setupPlayer();
    return () => {
      cleanup();
    };
  }, []);

  const setupPlayer = async () => {
    try {
      await setupAudio();

      if (!article.audio_url) {
        Alert.alert("Error", "Audio not ready yet. Please try again later.");
        navigation.goBack();
        return;
      }

      const audioUrl = `${API_URL}${article.audio_url}`;
      await loadAudio(audioUrl, onPlaybackStatusUpdate);

      if (article.play_position_seconds > 0) {
        await seekAudio(article.play_position_seconds * 1000);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error setting up player:", error);
      Alert.alert("Error", "Failed to load audio");
      setIsLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      setPosition(status.positionMillis / 1000);
      setDuration(status.durationMillis / 1000);

      if (
        status.isPlaying &&
        Math.floor(status.positionMillis / 1000) % 5 === 0
      ) {
        saveProgress(Math.floor(status.positionMillis / 1000));
      }

      if (status.didJustFinish) {
        setIsPlaying(false);
        saveProgress(0);
      }
    }
  };

  const saveProgress = async (positionSeconds) => {
    try {
      await articlesAPI.update(article.id, {
        play_position_seconds: positionSeconds,
        last_played_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const togglePlayback = async () => {
    if (isPlaying) {
      await pauseAudio();
    } else {
      await playAudio();
    }
  };

  const skipForward = async () => {
    const newPosition = Math.min(position + 10, duration);
    await seekAudio(newPosition * 1000);
  };

  const skipBackward = async () => {
    const newPosition = Math.max(position - 10, 0);
    await seekAudio(newPosition * 1000);
  };

  const restart = async () => {
    await seekAudio(0);
    if (!isPlaying) {
      await playAudio();
    }
  };

  const cleanup = async () => {
    await stopAudio();
    if (position > 0) {
      await saveProgress(Math.floor(position));
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading audio...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header with gradient */}
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            stopAudio();
            navigation.goBack();
          }}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={2}>
          {article.title}
        </Text>
        {article.collection_id && (
          <Text style={styles.headerCollection}>
            📁 {collectionName || "Collection"}
          </Text>
        )}

        {article.source_url && (
          <Text style={styles.headerUrl} numberOfLines={1}>
            {article.source_url.replace(/^https?:\/\//, "")}
          </Text>
        )}
      </LinearGradient>

      {/* Toggle button */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, !showText && styles.toggleButtonActive]}
          onPress={() => setShowText(false)}
        >
          <Text
            style={[styles.toggleText, !showText && styles.toggleTextActive]}
          >
            🎵 Player
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, showText && styles.toggleButtonActive]}
          onPress={() => setShowText(true)}
        >
          <Text
            style={[styles.toggleText, showText && styles.toggleTextActive]}
          >
            📄 Text
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content area */}
      {showText ? (
        <ScrollView
          ref={scrollViewRef}
          style={styles.textContainer}
          contentContainerStyle={styles.textContent}
        >
          <Text style={styles.articleText}>{article.content}</Text>
        </ScrollView>
      ) : (
        <View style={styles.visualizerContainer}>
          <View style={styles.visualizer}>
            <Text style={styles.nowPlayingText}>Now Playing</Text>
            <Text style={styles.timeDisplay}>{formatTime(position)}</Text>
            <Text style={styles.durationDisplay}>/ {formatTime(duration)}</Text>
          </View>
        </View>
      )}

      {/* Player Controls */}
      <View style={styles.playerContainer}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.progressFill,
                {
                  width: `${duration > 0 ? (position / duration) * 100 : 0}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={restart}>
            <View style={styles.controlCircle}>
              <Text style={styles.controlIcon}>🔄</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={skipBackward}>
            <View style={styles.controlCircle}>
              <Text style={styles.controlIcon}>⏪</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.playButtonGradient}
            >
              <Text style={styles.playIcon}>{isPlaying ? "⏸" : "▶️"}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={skipForward}>
            <View style={styles.controlCircle}>
              <Text style={styles.controlIcon}>⏩</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => {
              stopAudio();
              navigation.goBack();
            }}
          >
            <View style={styles.controlCircle}>
              <Text style={styles.controlIcon}>⏹</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    lineHeight: 32,
  },
  headerUrl: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  toggleContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#667eea",
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  toggleTextActive: {
    color: "#fff",
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  textContent: {
    paddingBottom: 40,
  },
  articleText: {
    fontSize: 17,
    lineHeight: 28,
    color: "#333",
    textAlign: "justify",
  },
  visualizerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  visualizer: {
    alignItems: "center",
  },
  nowPlayingText: {
    fontSize: 18,
    color: "#999",
    marginBottom: 24,
    fontWeight: "500",
  },
  timeDisplay: {
    fontSize: 56,
    fontWeight: "bold",
    color: "#667eea",
  },
  durationDisplay: {
    fontSize: 20,
    color: "#999",
    marginTop: 8,
  },
  playerContainer: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  timeText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
    width: 50,
    textAlign: "center",
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    marginHorizontal: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  controlButton: {
    width: 56,
    height: 56,
  },
  controlCircle: {
    width: "100%",
    height: "100%",
    borderRadius: 28,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },
  controlIcon: {
    fontSize: 24,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: "hidden",
    marginHorizontal: 12,
  },
  playButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  playIcon: {
    fontSize: 32,
  },
  headerCollection: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
    fontWeight: "600",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    marginBottom: 12,
  },
  backIcon: {
    fontSize: 24,
    color: "#fff",
  },
});

export default PlayerScreen;
