import { AuthGuard } from '@/components/common/AuthGuard';
import { menuItems } from '@/constants/menu-items';
import { useAuth, useSignOut } from '@/hooks/useAuth';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const { user } = useAuth();
  const signOutMutation = useSignOut();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            signOutMutation.mutate();
          },
        },
      ]
    );
  };

  return (
    <AuthGuard>
        <ScrollView className="flex-1">
          {/* Header */}
          <View className="bg-primary pb-8 pt-8 px-6" />
  
          {/* User Info Card */}
          <View className="mx-6 -mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <View className="items-center">
              {/* Avatar */}
              <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-4">
                <FontAwesome6 name="user" size={32} color="#155C8D" />
              </View>
  
              {/* User Details */}
              <Text className="text-xl font-bold text-gray-900">{user?.name || 'User'}</Text>
              <Text className="text-gray-500 mt-1">{user?.email || 'email@example.com'}</Text>
            </View>
          </View>
  
          {/* Menu Items */}
          <View className="mt-6 px-6">
            <Text className="text-gray-500 text-sm font-semibold mb-3 uppercase tracking-wide">
              Account Settings
            </Text>
  
            <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={item.onPress}
                  className={`flex-row items-center px-4 py-4 ${
                    index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                  activeOpacity={0.7}
                >
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <FontAwesome6 name={item.icon} size={18} color={item.color} />
                  </View>
                  <Text className="flex-1 text-gray-900 font-medium">{item.label}</Text>
                  <FontAwesome6 name="chevron-right" size={16} color="#9ca3af" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
  
          {/* Sign Out Button */}
          <View className="px-6 mt-8 mb-8">
            <TouchableOpacity
              onPress={handleSignOut}
              disabled={signOutMutation.isPending}
              className="bg-red-50 border border-red-200 rounded-xl px-6 py-4 flex-row items-center justify-center"
              activeOpacity={0.7}
            >
              <FontAwesome6 name="right-from-bracket" size={18} color="#ef4444" />
              <Text className="text-red-600 font-semibold ml-3">
                {signOutMutation.isPending ? 'Signing Out...' : 'Sign Out'}
              </Text>
            </TouchableOpacity>
          </View>
  
          {/* App Version */}
          <Text className="text-center text-gray-400 text-xs pb-6">
            Cat Health Tracker v1.0.0
          </Text>
        </ScrollView>
    </AuthGuard>
  );
}
