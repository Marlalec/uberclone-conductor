import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fieldStyles } from './formStyles';
import { useLanguage } from '../context/LanguageContext';
import { colors } from '../theme';

export default function CheckboxField({ label, value, onChange, error }) {
  const { t } = useLanguage();

  return (
    <View style={fieldStyles.container}>
      <Pressable
        style={styles.row}
        onPress={() => onChange(!value)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: value }}
      >
        <View style={[styles.box, error && fieldStyles.inputError, value && styles.checked]}>
          {value ? <Text style={styles.check}>✓</Text> : null}
        </View>
        <Text style={styles.label}>{t(label)}</Text>
      </Pressable>
      {error ? <Text style={fieldStyles.error}>{t(error)}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  box: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 6,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  check: {
    color: colors.surface,
    fontWeight: '700',
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
});
