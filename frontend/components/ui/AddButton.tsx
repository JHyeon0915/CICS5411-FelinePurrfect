import { Colors } from '@/constants/colors';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Text, View } from 'react-native';

interface AddButtonProps {
  title?: string;
  iconSize?: number;
  buttonSize?: 'sm' | 'md' | 'lg';
}

export function AddButton({ 
  title, 
  iconSize = 24,
  buttonSize = 'md',
}: AddButtonProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
  };

  return (
    <View className="flex-column items-center gap-y-1">
      {/* Plus Icon */}
      <View className={`${sizeClasses[buttonSize]} rounded-full bg-primary-100 items-center justify-center mb-2`}>
        <FontAwesome6 name="plus" size={iconSize} color={Colors.primary[500]} />
      </View>
      
      {/* Title */}
      {title && (
        <Text className="text-primary font-bold text-center">
          {title}
        </Text>
      )}
    </View>
  );
}