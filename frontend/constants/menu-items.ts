import { router } from 'expo-router';
import { Alert } from 'react-native';

// Profile page menu items
export const menuItems = [
  {
    icon: 'user',
    label: 'Edit Profile',
    onPress: () => router.push('/profile/edit'),
    color: '#155C8D',
  },
  {
    icon: 'lock',
    label: 'Change Password',
    onPress: () => router.push('/(auth)/change-password'),
    color: '#2476B5',
  },
  {
    icon: 'bell',
    label: 'Notifications',
    onPress: () => Alert.alert('Coming Soon', 'Notification settings will be available soon'),
    color: '#f59e0b',
  },
  {
    icon: 'shield',
    label: 'Privacy & Security',
    onPress: () => Alert.alert('Coming Soon', 'Privacy settings will be available soon'),
    color: '#10b981',
  },
  {
    icon: 'circle-info',
    label: 'About',
    onPress: () => Alert.alert('Cat Health Tracker', 'Version 1.0.0\n\nTrack your cat\'s daily health and activities.'),
    color: '#6b7280',
  },
];