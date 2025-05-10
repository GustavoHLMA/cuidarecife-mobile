import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MedicationCard = () => {
  // Mock data for the medication
  const medication = {
    name: 'Losartana',
    dosage: '50mg',
    image: require('./path-to-your-image.png'), // Replace with the path to your image
    doses: 5, // Total number of doses
    taken: 2, // Number of doses already taken
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={medication.image} style={styles.image} />
        <View style={styles.textContainer}>
          <Text style={styles.medicationName}>{medication.name}</Text>
          <Text style={styles.dosage}>{medication.dosage}</Text>
        </View>
      </View>
      <View style={styles.doseContainer}>
        {Array.from({ length: medication.doses }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dose,
              index < medication.taken && styles.doseTaken,
            ]}
          />
        ))}
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Acabou :(</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Tomei!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e77b7',
    borderRadius: 10,
    padding: 15,
    width: 300,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  image: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  textContainer: {
    flexDirection: 'column',
  },
  medicationName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  dosage: {
    color: '#fff',
    fontSize: 14,
  },
  doseContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  dose: {
    width: 20,
    height: 20,
    backgroundColor: '#fff',
    borderRadius: 50,
    marginRight: 5,
  },
  doseTaken: {
    backgroundColor: '#ffcc00',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#ffcc00',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#1e77b7',
    fontWeight: 'bold',
  },
});

export default MedicationCard;
