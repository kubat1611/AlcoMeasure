import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { TouchableOpacity, ActionSheetIOS } from 'react-native';

const calculateBAC = (alcoholMl: number, weight: number, gender: string, hours: number) => {
  const r = gender === 'male' ? 0.68 : 0.55;
  const grams = alcoholMl * 0.789; // jest OK
  const bac = (grams / (weight * r)) * 100 - 0.15 * hours;
  return Math.max(bac, 0);
};

export default function NewMeasurementScreen() {
  const [volume, setVolume] = useState('');
  const [percent, setPercent] = useState('');
  const [hoursAgo, setHoursAgo] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('male');

  const handleSave = async () => {
  try {
    const v = parseFloat(volume);
    const p = parseFloat(percent);
    const h = parseFloat(hoursAgo);
    const w = parseFloat(weight);

    if (isNaN(v) || isNaN(p) || isNaN(h) || isNaN(w)) {
      Alert.alert('Błąd', 'Uzupełnij poprawnie wszystkie pola');
      return;
    }

    const alcoholMl = v * (p / 100); // zostaje tak jak jest
    const bac = calculateBAC(alcoholMl, w, gender, h);

    await addDoc(collection(db, 'measurements'), {
      bac,
      timestamp: serverTimestamp(),
      alcoholMl,
      percent: p,
      hoursAgo: h,
    });

    Alert.alert(
      'Score',
      `Your BAC level is: ${bac.toFixed(2)} %`,
      [
        {
          text: 'Zamknij',
          style: 'cancel',
        },
        {
          text: 'Dodaj do leaderboardu',
          onPress: () => promptForNameAndSave(bac),
        },
      ]
    );
  } catch (err) {
    console.error('Błąd zapisu:', err);
    Alert.alert('Błąd', 'Nie udało się zapisać pomiaru.');
  }
};




const promptForNameAndSave = (bac: number) => {
  Alert.prompt(
    'Podaj swoją nazwę',
    'Wpisz nazwę, która pojawi się na leaderboardzie:',
    [
      {
        text: 'Anuluj',
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: async (name) => {
          if (!name) {
            Alert.alert('Błąd', 'Nazwa nie może być pusta.');
            return;
          }

          try {
            await addDoc(collection(db, 'leaderboard'), {
              name,
              bac,
              timestamp: serverTimestamp(),
            });
            Alert.alert('Sukces', 'Dodano do leaderboardu!');
          } catch (err) {
            console.error('Błąd leaderboard:', err);
            Alert.alert('Błąd', 'Nie udało się zapisać do leaderboardu.');
          }
        },
      },
    ],
    'plain-text'
  );
};


  return (
    <KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  keyboardVerticalOffset={100}
>
  <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>New Measurement 🧪</Text>

    <TextInput
      placeholder="Amount of alcohol (ml)"
      keyboardType="numeric"
      value={volume}
      onChangeText={setVolume}
      style={styles.input}
      placeholderTextColor="#aaa"
    />

    <TextInput
      placeholder="Alcohol voltage (%)"
      keyboardType="numeric"
      value={percent}
      onChangeText={setPercent}
      style={styles.input}
      placeholderTextColor="#aaa"
    />

    <TextInput
      placeholder="How many hours ago?"
      keyboardType="numeric"
      value={hoursAgo}
      onChangeText={setHoursAgo}
      style={styles.input}
      placeholderTextColor="#aaa"
    />

    <TextInput
      placeholder="Weight (kg)"
      keyboardType="numeric"
      value={weight}
      onChangeText={setWeight}
      style={styles.input}
      placeholderTextColor="#aaa"
    />

    <Text style={styles.label}>Gender:</Text>
    <TouchableOpacity
      style={styles.selector}
      onPress={() =>
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['Cancel', 'Male', 'Female'],
            cancelButtonIndex: 0,
          },
          (buttonIndex) => {
            if (buttonIndex === 1) setGender('male');
            else if (buttonIndex === 2) setGender('female');
          }
        )
      }
    >
      <Text style={styles.selectorText}>
        {gender === 'male' ? 'Male' : 'Female'}
      </Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.button} onPress={handleSave}>
      <Text style={styles.buttonText}>Calculate and Save</Text>
    </TouchableOpacity>
  </ScrollView>
</KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#000',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  selector: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  padding: 12,
  backgroundColor: '#fff',
  marginBottom: 16,
},
selectorText: {
  fontSize: 16,
  color: '#000',
},
});
