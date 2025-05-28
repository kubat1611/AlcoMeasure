import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/config';

type LeaderEntry = {
  id: string;
  name: string;
  bac: number;
};

export default function LeaderboardScreen() {
  const [data, setData] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const q = query(collection(db, 'leaderboard'), orderBy('bac', 'desc'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LeaderEntry[];
      setData(items);
      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  const podium = data.slice(0, 3);
  const rest = data.slice(3);

  const medals = ['🥇', '🥈', '🥉'];
  const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];
  const podiumHeights = [130, 100, 90]; // index 0 = 1st, 1 = 2nd, 2 = 3rd

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard 🏆</Text>

      {/* Podium (in order 2nd, 1st, 3rd) */}
      <View style={styles.podiumContainer}>
        {[1, 0, 2].map(index => {
          const item = podium[index];
          if (!item) return null;

          return (
            <View
              key={item.id}
              style={[
                styles.podiumCard,
                { backgroundColor: colors[index], height: podiumHeights[index] },
                index === 0 && styles.winnerCard, // 1st place styling
              ]}
            >
              <Text style={styles.medal}>{medals[index]}</Text>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.bac}>{item.bac.toFixed(2)}%</Text>
            </View>
          );
        })}
      </View>

      {/* Remaining list */}
      <FlatList
        data={rest}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{index + 4}. {item.name}</Text>
            <Text style={styles.bac}>{item.bac.toFixed(2)}%</Text>
          </View>
        )}
        ListEmptyComponent={
          !loading && data.length === 0 ? (
            <Text style={styles.emptyText}>No scores have been saved on the leaderboard yet.</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },

  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  podiumCard: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 12,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  winnerCard: {
    borderWidth: 3,
    borderColor: '#FFD700',
    transform: [{ scale: 1.05 }],
  },
  medal: { fontSize: 30 },
  name: { fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  bac: { fontSize: 14, textAlign: 'center' },

  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  emptyText: {
    marginTop: 50,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});
