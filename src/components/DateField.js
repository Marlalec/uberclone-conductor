import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { buttonStyles, fieldStyles } from './formStyles';

const DEFAULT_DATE = new Date(2000, 0, 1);

const formatDate = (date) => date.toLocaleDateString('es-CO');

export default function DateField({ label, value, onChange, error, maximumDate, minimumDate }) {
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
      <Text style={fieldStyles.label}>{label}</Text>
      <Pressable style={[fieldStyles.input, error && fieldStyles.inputError]} onPress={open}>
        <Text style={value ? fieldStyles.value : fieldStyles.placeholder}>
          {value ? formatDate(value) : 'Selecciona una fecha'}
        </Text>
      </Pressable>
      {error ? <Text style={fieldStyles.error}>{error}</Text> : null}
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
                <Text style={buttonStyles.text}>Listo</Text>
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: 32,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
});
