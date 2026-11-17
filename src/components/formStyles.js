import { StyleSheet } from 'react-native';
import { colors, radius } from '../theme';

export const fieldStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: colors.text,
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    justifyContent: 'center',
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.danger,
  },
  value: {
    fontSize: 16,
    color: colors.text,
  },
  placeholder: {
    fontSize: 16,
    color: colors.placeholder,
  },
  error: {
    marginTop: 4,
    fontSize: 13,
    color: colors.danger,
  },
});

export const buttonStyles = StyleSheet.create({
  button: {
    minHeight: 52,
    backgroundColor: colors.ink,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  disabled: {
    backgroundColor: colors.placeholder,
  },
  text: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
});
