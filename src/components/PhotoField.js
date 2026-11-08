import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { fieldStyles } from './formStyles';

const PICKER_OPTIONS = {
  mediaTypes: ['images'],
  allowsEditing: true,
  quality: 0.7,
};

export default function PhotoField({ label, value, onChange, error }) {
  const [permissionError, setPermissionError] = useState('');

  const handleResult = (result) => {
    if (!result.canceled) {
      setPermissionError('');
      onChange(result.assets[0].uri);
    }
  };

  const pickFromCamera = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      setPermissionError('Debes permitir el acceso a la cámara');
      return;
    }
    handleResult(await ImagePicker.launchCameraAsync(PICKER_OPTIONS));
  };

  const pickFromGallery = async () => {
    handleResult(await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS));
  };

  const message = permissionError || error;

  return (
    <View style={fieldStyles.container}>
      <Text style={fieldStyles.label}>{label}</Text>
      {value ? (
        <Image source={{ uri: value }} style={styles.preview} />
      ) : (
        <View style={[styles.preview, styles.empty, error && fieldStyles.inputError]}>
          <Text style={fieldStyles.placeholder}>Sin foto</Text>
        </View>
      )}
      <View style={styles.actions}>
        <Pressable style={styles.action} onPress={pickFromCamera}>
          <Text style={styles.actionText}>Cámara</Text>
        </Pressable>
        <Pressable style={styles.action} onPress={pickFromGallery}>
          <Text style={styles.actionText}>Galería</Text>
        </Pressable>
      </View>
      {message ? <Text style={fieldStyles.error}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  preview: {
    width: 120,
    height: 120,
    borderRadius: 8,
    alignSelf: 'center',
  },
  empty: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  action: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionText: {
    fontWeight: '600',
  },
});
