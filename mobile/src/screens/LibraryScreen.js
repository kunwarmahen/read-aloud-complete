import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { articlesAPI, collectionsAPI } from "../api/client";
import { AuthContext } from "../auth/AuthContext";
import ArticleCard from "../components/ArticleCard";

const LibraryScreen = ({ navigation }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const { logout, user } = useContext(AuthContext);

  useEffect(() => {
    loadArticles();
    loadCollections();
  }, [selectedCollection]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const response = await articlesAPI.getAll(0, 50, selectedCollection);
      setArticles(response.data);
    } catch (error) {
      console.error("Error loading articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCollectionName = (collectionId) => {
    if (!collectionId) return null;
    return collections.find((c) => c.id === collectionId)?.name;
  };

  const loadCollections = async () => {
    try {
      const response = await collectionsAPI.getAll();
      setCollections(response.data);
    } catch (error) {
      console.error("Error loading collections:", error);
    }
  };

  const handleArticlePress = (article) => {
    if (!article.audio_url) {
      return;
    }
    const collectionName = getCollectionName(article.collection_id);
    navigation.navigate("Player", { article, collectionName });
  };
  const renderCollectionTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.collectionTabs}
      contentContainerStyle={styles.collectionTabsContent}
    >
      <TouchableOpacity
        style={[
          styles.collectionTab,
          !selectedCollection && styles.collectionTabActive,
        ]}
        onPress={() => setSelectedCollection(null)}
      >
        <Text
          style={[
            styles.collectionTabText,
            !selectedCollection && styles.collectionTabTextActive,
          ]}
        >
          All Articles
        </Text>
      </TouchableOpacity>

      {collections.map((collection) => (
        <TouchableOpacity
          key={collection.id}
          style={[
            styles.collectionTab,
            selectedCollection === collection.id && styles.collectionTabActive,
          ]}
          onPress={() => setSelectedCollection(collection.id)}
        >
          <Text
            style={[
              styles.collectionTabText,
              selectedCollection === collection.id &&
                styles.collectionTabTextActive,
            ]}
          >
            {collection.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderHeader = () => (
    <LinearGradient
      colors={["#667eea", "#764ba2"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || "User"}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutIcon}>👋</Text>
        </TouchableOpacity>
      </View>

      {renderCollectionTabs()}

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{articles.length}</Text>
          <Text style={styles.statLabel}>Articles</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {articles.filter((a) => a.play_position_seconds > 0).length}
          </Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {Math.floor(
              articles.reduce((sum, a) => sum + (a.duration_seconds || 0), 0) /
                60
            )}
            m
          </Text>
          <Text style={styles.statLabel}>Total Time</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📚</Text>
      <Text style={styles.emptyTitle}>No articles yet</Text>
      <Text style={styles.emptyText}>
        Save articles from the Chrome extension to see them here
      </Text>
      <TouchableOpacity style={styles.refreshButton} onPress={loadArticles}>
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.refreshButtonGradient}
        >
          <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={articles}
        renderItem={({ item }) => (
          <ArticleCard
            article={item}
            collectionName={getCollectionName(item.collection_id)}
            onPress={() => handleArticlePress(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading && renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadArticles}
            tintColor="#667eea"
            colors={["#667eea", "#764ba2"]}
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 4,
  },
  logoutButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutIcon: {
    fontSize: 24,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statBox: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  refreshButton: {
    borderRadius: 25,
    overflow: "hidden",
  },
  refreshButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  collectionTabs: {
    marginBottom: 16,
  },
  collectionTabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  collectionTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginRight: 8,
  },
  collectionTabActive: {
    backgroundColor: "#fff",
  },
  collectionTabText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 13,
    fontWeight: "600",
  },
  collectionTabTextActive: {
    color: "#667eea",
  },
});

export default LibraryScreen;
