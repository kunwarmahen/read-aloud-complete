import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const NotificationsScreen = ({ navigation }) => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [newArticles, setNewArticles] = useState(true);
  const [progress, setProgress] = useState(false);
  const [updates, setUpdates] = useState(true);

  const NotificationItem = ({
    title,
    description,
    value,
    onValueChange,
    icon,
  }) => (
    <View style={styles.item}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#ddd", true: "#667eea" }}
        thumbColor={value ? "#fff" : "#f4f3f4"}
      />
    </View>
  );

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
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.backButton} />
      </LinearGradient>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GENERAL</Text>
          <View style={styles.card}>
            <NotificationItem
              icon="🔔"
              title="Push Notifications"
              description="Master switch for all notifications"
              value={pushEnabled}
              onValueChange={setPushEnabled}
            />
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ARTICLE UPDATES</Text>
          <View style={styles.card}>
            <NotificationItem
              icon="📄"
              title="New Articles"
              description="When articles finish processing"
              value={newArticles}
              onValueChange={setNewArticles}
            />
            <View style={styles.divider} />
            <NotificationItem
              icon="📊"
              title="Progress Updates"
              description="Daily listening streaks and stats"
              value={progress}
              onValueChange={setProgress}
            />
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APP UPDATES</Text>
          <View style={styles.card}>
            <NotificationItem
              icon="✨"
              title="Feature Updates"
              description="New features and improvements"
              value={updates}
              onValueChange={setUpdates}
            />
          </View>
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
  section: { marginTop: 24, paddingHorizontal: 20 },
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
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#f0f4ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  icon: { fontSize: 24 },
  content: { flex: 1 },
  title: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 2 },
  description: { fontSize: 13, color: "#999" },
  divider: { height: 1, backgroundColor: "#f0f0f0", marginLeft: 76 },
});

export default NotificationsScreen;
