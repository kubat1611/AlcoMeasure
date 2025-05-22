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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard 🏆</Text>
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{index + 1}. {item.name}</Text>
            <Text style={styles.bac}>{item.bac.toFixed(2)} %</Text>
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
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
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  name: { fontSize: 18 },
  bac: { fontSize: 18, fontWeight: 'bold' },
  emptyText: {
    marginTop: 50,
    fontSize: 16,
    color: '#888',
    textAlign: 'center'
  },
});
