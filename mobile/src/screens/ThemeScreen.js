import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const ThemeScreen = ({ navigation }) => {
  const [selectedTheme, setSelectedTheme] = useState("light");

  const themes = [
    {
      id: "light",
      name: "Light Mode",
      description: "Clean and bright",
      icon: "☀️",
      colors: ["#fff", "#f8f9fa"],
      gradient: ["#667eea", "#764ba2"],
    },
    {
      id: "dark",
      name: "Dark Mode",
      description: "Easy on the eyes",
      icon: "🌙",
      colors: ["#1a1a1a", "#2d2d2d"],
      gradient: ["#4facfe", "#00f2fe"],
    },
    {
      id: "auto",
      name: "Auto",
      description: "Follow system",
      icon: "🔄",
      colors: ["#fff", "#1a1a1a"],
      gradient: ["#11998e", "#38ef7d"],
    },
  ];

  const ThemeCard = ({ theme }) => (
    <TouchableOpacity
      style={[
        styles.themeCard,
        selectedTheme === theme.id && styles.themeCardSelected,
      ]}
      onPress={() => setSelectedTheme(theme.id)}
    >
      <View style={styles.themePreview}>
        <LinearGradient colors={theme.gradient} style={styles.themeGradient}>
          <Text style={styles.themeIcon}>{theme.icon}</Text>
        </LinearGradient>
        <View style={styles.themeColors}>
          <View
            style={[styles.colorBox, { backgroundColor: theme.colors[0] }]}
          />
          <View
            style={[styles.colorBox, { backgroundColor: theme.colors[1] }]}
          />
        </View>
      </View>
      <View style={styles.themeInfo}>
        <Text style={styles.themeName}>{theme.name}</Text>
        <Text style={styles.themeDescription}>{theme.description}</Text>
      </View>
      {selectedTheme === theme.id && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Theme</Text>
        <View style={styles.backButton} />
      </LinearGradient>

      <ScrollView style={styles.content}>
        <Text style={styles.subtitle}>Choose your preferred theme</Text>

        <View style={styles.themesContainer}>
          {themes.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Theme changes will be applied immediately across the app.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.applyButton}>
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            style={styles.applyGradient}
          >
            <Text style={styles.applyText}>Apply Theme</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
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
  backIcon: {
    fontSize: 24,
    color: "#fff",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  themesContainer: {
    padding: 20,
    gap: 16,
  },
  themeCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  themeCardSelected: {
    borderColor: "#667eea",
    borderWidth: 3,
  },
  themePreview: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
  },
  themeGradient: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  themeIcon: {
    fontSize: 40,
  },
  themeColors: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
  colorBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  themeInfo: {
    marginBottom: 8,
  },
  themeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 14,
    color: "#999",
  },
  checkmark: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  infoBox: {
    flexDirection: "row",
    margin: 20,
    padding: 16,
    backgroundColor: "#fff3cd",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107",
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#856404",
    lineHeight: 20,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  applyButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  applyGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  applyText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ThemeScreen;
