import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { colors } from '../theme';

export default function FilterChips({ options, value, onChange }) {
  const { t } = useLanguage();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={[styles.chip, selected && styles.selected]}
            onPress={() => onChange(option.value)}
          >
            <Text style={[styles.text, selected && styles.selectedText]}>{t(option.label)}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  row: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  text: {
    fontSize: 14,
    color: colors.textMuted,
  },
  selectedText: {
    color: colors.surface,
    fontWeight: '700',
  },
});
