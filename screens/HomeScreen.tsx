import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { db } from '../firebase/config';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

type RootStackParamList = {
  'New Measurement': undefined;
  History: undefined;
  Leaderboard: undefined;
  Profile: undefined;
};

export default function HomeScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [lastMeasurement, setLastMeasurement] = useState<any>(null);

  useEffect(() => {
    const fetchLast = async () => {
      try {
        const q = query(
          collection(db, 'measurements'),
          orderBy('timestamp', 'desc'),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setLastMeasurement(snapshot.docs[0].data());
        }
      } catch (err) {
        console.error('Error loading last measurement:', err);
      }
    };
    fetchLast();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AlcoMeasure</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('New Measurement')}>
        <Text style={styles.buttonText}>New Measurement</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('History')}>
        <Text style={styles.buttonText}>History</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Leaderboard')}>
        <Text style={styles.buttonText}>Leaderboard</Text>
      </TouchableOpacity>

      {lastMeasurement && (
        <View style={styles.widget}>
          <Text style={styles.widgetTitle}>Latest Measurement:</Text>
          <Text style={styles.bac}>BAC: {lastMeasurement.bac.toFixed(2)} %</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  widget: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    alignItems: 'center',
  },
  widgetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bac: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  },
});
