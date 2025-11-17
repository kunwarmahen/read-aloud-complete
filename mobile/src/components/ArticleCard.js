import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const ArticleCard = ({ article, onPress, collectionName }) => {
  const formatDuration = (seconds) => {
    if (!seconds) return "Processing...";
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;

    if (hrs > 0) {
      return `${hrs}h ${remainingMins}m`;
    }
    return `${mins} min`;
  };

  const getProgressPercent = () => {
    if (!article.duration_seconds || article.play_position_seconds === 0) {
      return 0;
    }
    return (article.play_position_seconds / article.duration_seconds) * 100;
  };

  const isProcessing = !article.audio_url || !article.duration_seconds;

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isProcessing}
    >
      <View style={styles.card}>
        {/* Status badge */}
        {isProcessing && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>⏳ Processing</Text>
          </View>
        )}

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {article.title}
        </Text>

        {article.collection_id && (
          <Text style={styles.collectionBadge}>
            📁 {collectionName || "Collection"}
          </Text>
        )}

        {/* Meta info */}
        <View style={styles.metaContainer}>
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>
              🎵 {formatDuration(article.duration_seconds)}
            </Text>
          </View>

          {article.play_position_seconds > 0 && (
            <View style={styles.progressBadge}>
              <Text style={styles.progressText}>
                {Math.floor(getProgressPercent())}% played
              </Text>
            </View>
          )}
        </View>

        {/* Progress bar */}
        {article.play_position_seconds > 0 && (
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBg}>
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.progressBarFill,
                  { width: `${getProgressPercent()}%` },
                ]}
              />
            </View>
          </View>
        )}

        {/* Source URL */}
        {article.source_url && (
          <Text style={styles.sourceUrl} numberOfLines={1}>
            🔗 {article.source_url.replace(/^https?:\/\//, "")}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  badge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#FFA500",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#1a1a1a",
    lineHeight: 24,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
    gap: 8,
  },
  durationBadge: {
    backgroundColor: "#f0f4ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  durationText: {
    fontSize: 13,
    color: "#667eea",
    fontWeight: "600",
  },
  progressBadge: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  progressText: {
    fontSize: 12,
    color: "#4caf50",
    fontWeight: "600",
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  sourceUrl: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  collectionBadge: {
    fontSize: 12,
    color: "#667eea",
    marginBottom: 8,
    fontWeight: "600",
    backgroundColor: "#f0f4ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
});

export default ArticleCard;
