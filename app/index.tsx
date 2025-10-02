import React from 'react';
import { Redirect } from 'expo-router';

export default function Gate() {
  // Toujours ouvrir sur la liste des tâches (onglet index), connecté ou non
  return <Redirect href="/(tabs)" />;
}
