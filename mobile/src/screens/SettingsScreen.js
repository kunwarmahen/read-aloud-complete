import React, { useContext } from "react";
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
import { AuthContext } from "../auth/AuthContext";

const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          onPress: logout,
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const SettingItem = ({ icon, title, subtitle, onPress, danger }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingIcon}>
        <Text style={styles.settingIconText}>{icon}</Text>
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, danger && styles.dangerText]}>
          {title}
        </Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Text style={styles.settingArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Profile Header */}
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.profileHeader}
      >
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0)?.toUpperCase() || "👤"}
          </Text>
        </View>
        <Text style={styles.profileName}>{user?.name || "User"}</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
      </LinearGradient>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <View style={styles.sectionCard}>
          <SettingItem
            icon="👤"
            title="Profile"
            subtitle="Edit your profile information"
            onPress={() => navigation.navigate("Profile")}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="🔒"
            title="Privacy"
            subtitle="Manage your privacy settings"
            onPress={() => navigation.navigate("Privacy")}
          />
        </View>
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>APP SETTINGS</Text>
        <View style={styles.sectionCard}>
          <SettingItem
            icon="🎨"
            title="Theme"
            subtitle="Light mode"
            onPress={() => navigation.navigate("Theme")}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="🔔"
            title="Notifications"
            subtitle="Manage push notifications"
            onPress={() => navigation.navigate("Notifications")}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="💾"
            title="Storage"
            subtitle="Manage downloaded articles"
            onPress={() => navigation.navigate("Storage")}
          />
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ABOUT</Text>
        <View style={styles.sectionCard}>
          <SettingItem
            icon="ℹ️"
            title="About"
            subtitle="Version 1.0.0"
            onPress={() => navigation.navigate("About")}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="📖"
            title="Help & Support"
            subtitle="Get help with the app"
            onPress={() =>
              Alert.alert("Help", "Visit our help center for assistance")
            }
          />
          <View style={styles.divider} />
          <SettingItem
            icon="⭐"
            title="Rate Us"
            subtitle="Enjoying the app? Rate us!"
            onPress={() =>
              Alert.alert("Thank You!", "Rating feature coming soon!")
            }
          />
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#ff6b6b", "#ee5a6f"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoutGradient}
          >
            <Text style={styles.logoutText}>🚪 Logout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>Made with ❤️ by Read Aloud Team</Text>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  profileHeader: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  avatarText: {
    fontSize: 48,
    color: "#fff",
    fontWeight: "bold",
  },
  profileName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#999",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#f0f4ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  settingIconText: {
    fontSize: 24,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: "#999",
  },
  settingArrow: {
    fontSize: 24,
    color: "#ccc",
    fontWeight: "300",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginLeft: 76,
  },
  dangerText: {
    color: "#ff6b6b",
  },
  logoutButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  logoutGradient: {
    paddingVertical: 18,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    textAlign: "center",
    color: "#999",
    fontSize: 13,
    marginTop: 32,
  },
});

export default SettingsScreen;
