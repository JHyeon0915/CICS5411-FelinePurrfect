import { Text, TouchableOpacity } from 'react-native';
import { twMerge } from 'tailwind-merge';

interface ButtonProps {
  content: string;
  onPress: () => void;
  disabled?: boolean;
  className?: string;
  textClassName?: string;
}

export function CustomButton ({
  content,
  onPress,
  disabled = false,
  className = '',
  textClassName = ''
}: ButtonProps) {
  const baseStyle = 'bg-primary px-4 py-5 rounded-xl items-center';
  const baseTextStyle = 'text-white text-lg font-bold';

  return(
    <TouchableOpacity
      className={twMerge(baseStyle + ' ' + className)}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text className={twMerge(baseTextStyle + ' ' + textClassName)}>
        {content}
      </Text>
    </TouchableOpacity>
  );
}