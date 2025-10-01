import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ProfileOption = ({ iconName, title, subtitle, profileType, selectedProfile, onSelect }) => {
  const isSelected = selectedProfile === profileType;

  return (
    <TouchableOpacity
      style={[styles.optionContainer, isSelected && styles.selectedOption]}
      onPress={() => onSelect(profileType)}
    >
      <MaterialCommunityIcons name={iconName} size={40} color="#FF6F00" />
      <View style={styles.textContainer}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
      <View style={[styles.radioButton, isSelected && styles.radioSelected]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#2A2A2A',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: '#FF6F00',
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#AAA',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFF',
    marginLeft: 'auto',
  },
  radioSelected: {
    backgroundColor: '#FF6F00',
    borderColor: '#FF6F00',
  },
});

export default ProfileOption;