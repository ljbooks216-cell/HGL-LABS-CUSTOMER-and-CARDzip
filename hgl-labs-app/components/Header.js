import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Linking } from 'react-native';

const logo = require('../assets/logo.jpg');

export default function Header({ title, subtitle }) {
  const openWebsite = () => {
    Linking.openURL('https://hgl-labs.com/');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={openWebsite} style={styles.logoContainer}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
      </TouchableOpacity>
      <Text style={styles.tagline}>Accurate. Confidential. Integrity</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  logoContainer: {
    width: '100%',
    alignItems: 'center',
  },
  logo: {
    width: 280,
    height: 60,
  },
  tagline: {
    fontSize: 11,
    color: '#0066b3',
    fontStyle: 'italic',
    marginTop: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontWeight: '600',
  },
});
