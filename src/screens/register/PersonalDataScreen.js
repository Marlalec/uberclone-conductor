import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import FormField from '../../components/FormField';
import SelectField from '../../components/SelectField';
import DateField from '../../components/DateField';
import PhotoField from '../../components/PhotoField';
import { buttonStyles } from '../../components/formStyles';
import { useRegister } from '../../context/RegisterContext';
import { GENDERS, LANGUAGES } from '../../config/options';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../theme';

export const PERSONAL_FIELDS = [
  'profilePhoto',
  'fullName',
  'documentId',
  'phone',
  'birthDate',
  'gender',
  'email',
  'language',
];

export default function PersonalDataScreen({ navigation }) {
  const { personalData, personalErrors, touched, isPersonalValid, updatePersonalData, touchFields } = useRegister();

  const { t, changeLanguage } = useLanguage();

  const errorFor = (field) => (touched[field] ? personalErrors[field] : undefined);

  const handleLanguageChange = (value) => {
    updatePersonalData('language', value);
    changeLanguage(value);
  };

  const handleNext = () => {
    touchFields(PERSONAL_FIELDS);
    if (isPersonalValid) {
      navigation.navigate('Vehicle');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <PhotoField
        label="register.profilePhoto"
        value={personalData.profilePhoto}
        onChange={(value) => updatePersonalData('profilePhoto', value)}
        error={errorFor('profilePhoto')}
      />
      <FormField
        label="register.fullName"
        placeholder="register.fullNamePlaceholder"
        value={personalData.fullName}
        onChangeText={(value) => updatePersonalData('fullName', value)}
        maxLength={50}
        error={errorFor('fullName')}
      />
      <FormField
        label="register.documentId"
        placeholder="register.digits6to10"
        keyboardType="number-pad"
        value={personalData.documentId}
        onChangeText={(value) => updatePersonalData('documentId', value)}
        maxLength={10}
        error={errorFor('documentId')}
      />
      <FormField
        label="register.phone"
        placeholder="register.phonePlaceholder"
        keyboardType="phone-pad"
        value={personalData.phone}
        onChangeText={(value) => updatePersonalData('phone', value)}
        maxLength={10}
        error={errorFor('phone')}
      />
      <DateField
        label="register.birthDate"
        value={personalData.birthDate}
        onChange={(value) => updatePersonalData('birthDate', value)}
        maximumDate={new Date()}
        error={errorFor('birthDate')}
      />
      <SelectField
        label="register.gender"
        options={GENDERS}
        value={personalData.gender}
        onChange={(value) => updatePersonalData('gender', value)}
        error={errorFor('gender')}
      />
      <FormField
        label="register.email"
        placeholder="nombre@dominio.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={personalData.email}
        onChangeText={(value) => updatePersonalData('email', value)}
        error={errorFor('email')}
      />
      <SelectField
        label="register.language"
        options={LANGUAGES}
        value={personalData.language}
        onChange={handleLanguageChange}
        error={errorFor('language')}
      />
      <Pressable style={buttonStyles.button} onPress={handleNext}>
        <Text style={buttonStyles.text}>{t('common.next')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: colors.background,
  },
});
