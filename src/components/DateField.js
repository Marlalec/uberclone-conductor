import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { buttonStyles, fieldStyles } from './formStyles';
import { useLanguage } from '../context/LanguageContext';
import { colors, radius } from '../theme';

const DEFAULT_DATE = new Date(2000, 0, 1);

export default function DateField({ label, value, onChange, error, maximumDate, minimumDate }) {
  const { t, locale } = useLanguage();
  const initialDate = value ?? minimumDate ?? DEFAULT_DATE;
  const [visible, setVisible] = useState(false);
  const [tempDate, setTempDate] = useState(initialDate);

  const open = () => {
    setTempDate(initialDate);
    setVisible(true);
  };

  const handleAndroidChange = (event, date) => {
    setVisible(false);
    if (event.type === 'set' && date) {
      onChange(date);
    }
  };

  const confirmIos = () => {
    onChange(tempDate);
    setVisible(false);
  };

  return (
    <View style={fieldStyles.container}>
      <Text style={fieldStyles.label}>{t(label)}</Text>
      <Pressable style={[fieldStyles.input, error && fieldStyles.inputError]} onPress={open}>
        <Text style={value ? fieldStyles.value : fieldStyles.placeholder}>
          {value ? value.toLocaleDateString(locale) : t('common.selectDate')}
        </Text>
      </Pressable>
      {error ? <Text style={fieldStyles.error}>{t(error)}</Text> : null}
      {visible && Platform.OS === 'android' ? (
        <DateTimePicker
          value={tempDate}
          mode="date"
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onChange={handleAndroidChange}
        />
      ) : null}
      {Platform.OS === 'ios' ? (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
          <View style={styles.backdrop}>
            <View style={styles.sheet}>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                themeVariant="light"
                maximumDate={maximumDate}
                minimumDate={minimumDate}
                onChange={(event, date) => date && setTempDate(date)}
              />
              <Pressable style={buttonStyles.button} onPress={confirmIos}>
                <Text style={buttonStyles.text}>{t('common.done')}</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    padding: 16,
    paddingBottom: 32,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
});
