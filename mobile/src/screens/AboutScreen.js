import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const AboutScreen = ({ navigation }) => {
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
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.backButton} />
      </LinearGradient>
      <ScrollView style={styles.content}>
        <View style={styles.logoSection}>
          <Text style={styles.logo}>🎵</Text>
          <Text style={styles.appName}>Read Aloud</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.tagline}>Listen to your articles anywhere</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          <View style={styles.card}>
            <Text style={styles.description}>
              Read Aloud helps you consume content on the go. Save articles from
              the web and listen to them with high-quality text-to-speech
              technology.
            </Text>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LINKS</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.linkItem}
              onPress={() => Linking.openURL("https://example.com")}
            >
              <Text style={styles.linkIcon}>🌐</Text>
              <Text style={styles.linkText}>Website</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.linkItem}>
              <Text style={styles.linkIcon}>📜</Text>
              <Text style={styles.linkText}>Privacy Policy</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.linkItem}>
              <Text style={styles.linkIcon}>⚖️</Text>
              <Text style={styles.linkText}>Terms of Service</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.footer}>Made with ❤️ by Read Aloud Team</Text>
        <Text style={styles.copyright}>
          © 2024 Read Aloud. All rights reserved.
        </Text>
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
  logoSection: {
    alignItems: "center",
    paddingVertical: 48,
    backgroundColor: "#fff",
    marginBottom: 24,
  },
  logo: { fontSize: 80, marginBottom: 16 },
  appName: { fontSize: 32, fontWeight: "bold", color: "#333", marginBottom: 4 },
  version: { fontSize: 14, color: "#999", marginBottom: 8 },
  tagline: { fontSize: 16, color: "#666", textAlign: "center" },
  section: { marginTop: 8, paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#999",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  description: { fontSize: 15, color: "#666", lineHeight: 24 },
  linkItem: { flexDirection: "row", alignItems: "center", paddingVertical: 16 },
  linkIcon: { fontSize: 24, marginRight: 16 },
  linkText: { flex: 1, fontSize: 16, fontWeight: "600", color: "#333" },
  arrow: { fontSize: 24, color: "#ccc" },
  divider: { height: 1, backgroundColor: "#f0f0f0", marginLeft: 56 },
  footer: { textAlign: "center", color: "#999", fontSize: 14, marginTop: 32 },
  copyright: {
    textAlign: "center",
    color: "#ccc",
    fontSize: 12,
    marginTop: 8,
    marginBottom: 40,
  },
});

export default AboutScreen;
