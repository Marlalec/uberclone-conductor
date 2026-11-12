import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fieldStyles } from './formStyles';

export default function CheckboxField({ label, value, onChange, error }) {
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
        <Text style={styles.label}>{label}</Text>
      </Pressable>
      {error ? <Text style={fieldStyles.error}>{error}</Text> : null}
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
    borderColor: '#ccc',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  check: {
    color: '#fff',
    fontWeight: '700',
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: '#222',
  },
});
