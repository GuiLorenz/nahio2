import React from 'react';
 import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
 import { colors } from '../styles/colors';
 import { globalStyles } from '../styles/globalStyles';
 const LoadingScreen = ({ message = 'Carregando...' }) => {
 return (
 <View style={[globalStyles.centerContainer, styles.container]}>
 <ActivityIndicator size="large" color={colors.primary} />
 <Text style={styles.message}>{message}</Text>
 </View>
 );
 };
 const styles = StyleSheet.create({
 container: {
 backgroundColor: colors.background,
 },
 message: {
 color: colors.textSecondary,
 fontSize: 16,
 marginTop: 20,
 textAlign: 'center',
 },
 });
 export default LoadingScreen;
