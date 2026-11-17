import { Text, TextInput, View } from 'react-native';
import { fieldStyles } from './formStyles';
import { useLanguage } from '../context/LanguageContext';
import { colors } from '../theme';

export default function FormField({ label, error, placeholder, ...inputProps }) {
  const { t } = useLanguage();

  return (
    <View style={fieldStyles.container}>
      <Text style={fieldStyles.label}>{t(label)}</Text>
      <TextInput
        style={[fieldStyles.input, error && fieldStyles.inputError]}
        placeholder={t(placeholder)}
        placeholderTextColor={colors.placeholder}
        {...inputProps}
      />
      {error ? <Text style={fieldStyles.error}>{t(error)}</Text> : null}
    </View>
  );
}
