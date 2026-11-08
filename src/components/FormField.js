import { Text, TextInput, View } from 'react-native';
import { fieldStyles } from './formStyles';

export default function FormField({ label, error, ...inputProps }) {
  return (
    <View style={fieldStyles.container}>
      <Text style={fieldStyles.label}>{label}</Text>
      <TextInput
        style={[fieldStyles.input, error && fieldStyles.inputError]}
        placeholderTextColor="#999"
        {...inputProps}
      />
      {error ? <Text style={fieldStyles.error}>{error}</Text> : null}
    </View>
  );
}
