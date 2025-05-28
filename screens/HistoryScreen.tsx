import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function HistoryScreen() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeasurements = async () => {
      const q = query(
        collection(db, 'measurements'),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      const formatted = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          timestamp: d.timestamp?.toDate?.() || new Date(0), // Firestore Timestamp -> JS Date
        };
      });
      setData(formatted);
      setLoading(false);
    };
    fetchMeasurements();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Measurement History</Text>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Promile: {(item.bac / 100).toFixed(2)}
            </Text>
            <Text style={styles.cardTitle}>
              BAC: {item.bac.toFixed(2)}%
            </Text>
            <Text style={styles.cardSubtitle}>
              Date: {item.timestamp.toLocaleString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>No measurements saved yet.</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#007AFF',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#555',
  },
  emptyText: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
  },
});
