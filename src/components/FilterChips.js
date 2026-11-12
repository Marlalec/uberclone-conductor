import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

export default function FilterChips({ options, value, onChange }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={[styles.chip, selected && styles.selected]}
            onPress={() => onChange(option.value)}
          >
            <Text style={[styles.text, selected && styles.selectedText]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  selected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  text: {
    fontSize: 14,
    color: '#222',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600',
  },
});
