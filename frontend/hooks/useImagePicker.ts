import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';

interface UseImagePickerOptions {
  aspect?: [number, number];
  quality?: number;
  allowsEditing?: boolean;
}

export function useImagePicker(options?: UseImagePickerOptions) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isPickingImage, setIsPickingImage] = useState(false);

  const pickImage = async () => {
    setIsPickingImage(true);
    
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant photo library access to add cat photos.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Open Settings',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              },
            },
          ]
        );
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: options?.allowsEditing ?? true,
        aspect: options?.aspect ?? [1, 1],
        quality: options?.quality ?? 0.5,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        return uri;
      }
      
      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      return null;
    } finally {
      setIsPickingImage(false);
    }
  };

  // NEW: Convert URI to base64
  const convertToBase64 = async (uri: string): Promise<string> => {
    try {
      // Read file as base64
      const file = new File(uri);
      const base64 = await file.base64();
      return base64;
    } catch (error) {
      console.error('Error converting to base64:', error);
      throw error;
    }
  };

  const clearImage = () => {
    setImageUri(null);
  };

  return {
    imageUri,
    setImageUri,
    pickImage,
    convertToBase64,
    clearImage,
    isPickingImage,
  };
}