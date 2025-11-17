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

const PrivacyScreen = ({ navigation }) => {
  const [saveHistory, setSaveHistory] = useState(true);
  const [shareAnalytics, setShareAnalytics] = useState(false);
  const [allowNotifications, setAllowNotifications] = useState(true);
  const [publicProfile, setPublicProfile] = useState(false);

  const PrivacyItem = ({ title, description, value, onValueChange, icon }) => (
    <View style={styles.privacyItem}>
      <View style={styles.privacyIcon}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <View style={styles.privacyContent}>
        <Text style={styles.privacyTitle}>{title}</Text>
        <Text style={styles.privacyDescription}>{description}</Text>
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
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={styles.backButton} />
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATA & PRIVACY</Text>
          <View style={styles.card}>
            <PrivacyItem
              icon="📖"
              title="Save Reading History"
              description="Keep track of articles you've listened to"
              value={saveHistory}
              onValueChange={setSaveHistory}
            />
            <View style={styles.divider} />
            <PrivacyItem
              icon="📊"
              title="Share Analytics"
              description="Help us improve with anonymous usage data"
              value={shareAnalytics}
              onValueChange={setShareAnalytics}
            />
          </View>
        </View>

        {/* Security Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SECURITY</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIcon}>
                <Text style={styles.iconText}>🔒</Text>
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Change Password</Text>
                <Text style={styles.actionDescription}>
                  Update your password
                </Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIcon}>
                <Text style={styles.iconText}>📱</Text>
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Two-Factor Auth</Text>
                <Text style={styles.actionDescription}>
                  Add extra security layer
                </Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Permissions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PERMISSIONS</Text>
          <View style={styles.card}>
            <PrivacyItem
              icon="🔔"
              title="Push Notifications"
              description="Receive updates about new features"
              value={allowNotifications}
              onValueChange={setAllowNotifications}
            />
            <View style={styles.divider} />
            <PrivacyItem
              icon="🌐"
              title="Public Profile"
              description="Let others see your profile"
              value={publicProfile}
              onValueChange={setPublicProfile}
            />
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATA MANAGEMENT</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIcon}>
                <Text style={styles.iconText}>📥</Text>
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Download My Data</Text>
                <Text style={styles.actionDescription}>
                  Get a copy of your data
                </Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.actionItem}>
              <View style={[styles.actionIcon, styles.dangerIcon]}>
                <Text style={styles.iconText}>🗑️</Text>
              </View>
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, styles.dangerText]}>
                  Delete Account
                </Text>
                <Text style={styles.actionDescription}>
                  Permanently delete your account
                </Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            We take your privacy seriously. Your data is encrypted and never
            shared with third parties without your consent.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  privacyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  privacyIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#f0f4ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  iconText: {
    fontSize: 24,
  },
  privacyContent: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  privacyDescription: {
    fontSize: 13,
    color: "#999",
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#f0f4ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  dangerIcon: {
    backgroundColor: "#fee",
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 13,
    color: "#999",
  },
  dangerText: {
    color: "#ff6b6b",
  },
  arrow: {
    fontSize: 24,
    color: "#ccc",
    fontWeight: "300",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginLeft: 76,
  },
  infoBox: {
    flexDirection: "row",
    margin: 20,
    padding: 16,
    backgroundColor: "#e3f2fd",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#667eea",
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#1976d2",
    lineHeight: 20,
  },
});

export default PrivacyScreen;
