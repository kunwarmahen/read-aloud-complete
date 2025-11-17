import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const StorageScreen = ({ navigation }) => {
  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "Are you sure? This will remove all cached audio files.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => Alert.alert("Success", "Cache cleared!"),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Storage</Text>
        <View style={styles.backButton} />
      </LinearGradient>
      <ScrollView style={styles.content}>
        <View style={styles.storageCard}>
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            style={styles.usageGradient}
          >
            <Text style={styles.usageText}>Storage Used</Text>
            <Text style={styles.usageAmount}>245 MB</Text>
            <Text style={styles.usageSubtext}>of unlimited</Text>
          </LinearGradient>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BREAKDOWN</Text>
          <View style={styles.card}>
            <View style={styles.item}>
              <View style={[styles.iconBox, { backgroundColor: "#e3f2fd" }]}>
                <Text style={styles.icon}>🎵</Text>
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Audio Files</Text>
                <Text style={styles.itemSize}>180 MB</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.item}>
              <View style={[styles.iconBox, { backgroundColor: "#f3e5f5" }]}>
                <Text style={styles.icon}>💾</Text>
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>Cache</Text>
                <Text style={styles.itemSize}>65 MB</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleClearCache}
          >
            <LinearGradient
              colors={["#ff6b6b", "#ee5a6f"]}
              style={styles.actionGradient}
            >
              <Text style={styles.actionText}>🗑️ Clear Cache</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
  },
  backIcon: { fontSize: 24, color: "#fff" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  content: { flex: 1 },
  storageCard: {
    margin: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  usageGradient: { padding: 32, alignItems: "center" },
  usageText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 8,
  },
  usageAmount: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  usageSubtext: { fontSize: 14, color: "rgba(255, 255, 255, 0.8)" },
  section: { marginTop: 16, paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#999",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  item: { flexDirection: "row", alignItems: "center", padding: 16 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  icon: { fontSize: 24 },
  itemContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  itemSize: { fontSize: 16, color: "#667eea", fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#f0f0f0", marginLeft: 76 },
  actionButton: { marginTop: 24, borderRadius: 16, overflow: "hidden" },
  actionGradient: { paddingVertical: 16, alignItems: "center" },
  actionText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default StorageScreen;
