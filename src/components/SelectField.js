import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { fieldStyles } from './formStyles';
import { useLanguage } from '../context/LanguageContext';
import { colors, radius } from '../theme';

export default function SelectField({ label, value, options, onChange, error, placeholder = 'common.selectOption' }) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const selected = options.find((option) => option.value === value);

  const handleSelect = (option) => {
    onChange(option.value);
    setVisible(false);
  };

  return (
    <View style={fieldStyles.container}>
      <Text style={fieldStyles.label}>{t(label)}</Text>
      <Pressable style={[fieldStyles.input, error && fieldStyles.inputError]} onPress={() => setVisible(true)}>
        <Text style={selected ? fieldStyles.value : fieldStyles.placeholder}>
          {t(selected ? selected.label : placeholder)}
        </Text>
      </Pressable>
      {error ? <Text style={fieldStyles.error}>{t(error)}</Text> : null}
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <View style={styles.sheet}>
            <Text style={styles.title}>{t(label)}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable style={styles.option} onPress={() => handleSelect(item)}>
                  <Text style={[styles.optionText, item.value === value && styles.optionSelected]}>
                    {t(item.label)}
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
    backgroundColor: colors.backdrop,
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: 12,
    maxHeight: '70%',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },
  optionSelected: {
    fontWeight: '700',
    color: colors.ink,
  },
});
