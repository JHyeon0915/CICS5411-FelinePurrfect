import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { ReactNode } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

export interface MenuItem {
  title: string;
  icon?: string;
  onPress: () => void;
  destructive?: boolean;
}

interface MenuProps {
  visible: boolean;
  onDismiss: () => void;
  anchor: ReactNode;
  items: MenuItem[];
}

export function Menu({ visible, onDismiss, anchor, items }: MenuProps) {
  return (
    <View className='flex justify-center items-center'>
      {anchor}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onDismiss}
      >
        <Pressable 
          className="flex-1 bg-black/30" 
          onPress={onDismiss}
        >
          <View className="absolute top-24 right-8 bg-white rounded-xl shadow-lg overflow-hidden min-w-[180px]">
            {items.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={item.onPress}
                className={`flex-row items-center px-4 py-3 active:bg-gray-100 ${
                  index !== items.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                {item.icon && (
                  <FontAwesome6
                    name={item.icon as any}
                    size={16}
                    color={item.destructive ? '#ef4444' : '#374151'}
                    style={{ width: 20 }}
                  />
                )}
                <Text
                  className={`ml-3 text-base ${
                    item.destructive ? 'text-red-600 font-semibold' : 'text-gray-800'
                  }`}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}