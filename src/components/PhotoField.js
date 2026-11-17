import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { fieldStyles } from './formStyles';
import { useLanguage } from '../context/LanguageContext';
import { colors, radius } from '../theme';

const PICKER_OPTIONS = {
  mediaTypes: ['images'],
  allowsEditing: true,
  quality: 0.7,
  base64: true,
};

const DEFAULT_MIME_TYPE = 'image/jpeg';

const toDataUri = ({ base64, mimeType }) => `data:${mimeType ?? DEFAULT_MIME_TYPE};base64,${base64}`;

export default function PhotoField({ label, value, onChange, error }) {
  const { t } = useLanguage();
  const [permissionError, setPermissionError] = useState('');

  const handleResult = (result) => {
    if (!result.canceled) {
      setPermissionError('');
      onChange(toDataUri(result.assets[0]));
    }
  };

  const pickFromCamera = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      setPermissionError('common.cameraPermission');
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
      <Text style={fieldStyles.label}>{t(label)}</Text>
      {value ? (
        <Image source={{ uri: value }} style={styles.preview} />
      ) : (
        <View style={[styles.preview, styles.empty, error && fieldStyles.inputError]}>
          <Text style={fieldStyles.placeholder}>{t('common.noPhoto')}</Text>
        </View>
      )}
      <View style={styles.actions}>
        <Pressable style={styles.action} onPress={pickFromCamera}>
          <Text style={styles.actionText}>{t('common.camera')}</Text>
        </Pressable>
        <Pressable style={styles.action} onPress={pickFromGallery}>
          <Text style={styles.actionText}>{t('common.gallery')}</Text>
        </Pressable>
      </View>
      {message ? <Text style={fieldStyles.error}>{t(message)}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  preview: {
    width: 120,
    height: 120,
    borderRadius: radius.md,
    alignSelf: 'center',
  },
  empty: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.surface,
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
    borderColor: colors.ink,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionText: {
    fontWeight: '600',
    color: colors.ink,
  },
});
