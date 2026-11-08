import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { fieldStyles } from './formStyles';

export default function SelectField({ label, value, options, onChange, error, placeholder = 'Selecciona una opción' }) {
  const [visible, setVisible] = useState(false);
  const selected = options.find((option) => option.value === value);

  const handleSelect = (option) => {
    onChange(option.value);
    setVisible(false);
  };

  return (
    <View style={fieldStyles.container}>
      <Text style={fieldStyles.label}>{label}</Text>
      <Pressable style={[fieldStyles.input, error && fieldStyles.inputError]} onPress={() => setVisible(true)}>
        <Text style={selected ? fieldStyles.value : fieldStyles.placeholder}>
          {selected ? selected.label : placeholder}
        </Text>
      </Pressable>
      {error ? <Text style={fieldStyles.error}>{error}</Text> : null}
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <View style={styles.sheet}>
            <Text style={styles.title}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable style={styles.option} onPress={() => handleSelect(item)}>
                  <Text style={[styles.optionText, item.value === value && styles.optionSelected]}>
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    maxHeight: '70%',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionText: {
    fontSize: 16,
    color: '#222',
  },
  optionSelected: {
    fontWeight: '700',
  },
});
