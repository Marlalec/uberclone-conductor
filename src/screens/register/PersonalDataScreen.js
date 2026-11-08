import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import FormField from '../../components/FormField';
import SelectField from '../../components/SelectField';
import DateField from '../../components/DateField';
import PhotoField from '../../components/PhotoField';
import { buttonStyles } from '../../components/formStyles';
import { useRegister } from '../../context/RegisterContext';
import { GENDERS, LANGUAGES } from '../../config/options';

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

  const errorFor = (field) => (touched[field] ? personalErrors[field] : undefined);

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
        label="Foto de perfil"
        value={personalData.profilePhoto}
        onChange={(value) => updatePersonalData('profilePhoto', value)}
        error={errorFor('profilePhoto')}
      />
      <FormField
        label="Nombre completo"
        placeholder="Ej: Juan Pérez"
        value={personalData.fullName}
        onChangeText={(value) => updatePersonalData('fullName', value)}
        maxLength={50}
        error={errorFor('fullName')}
      />
      <FormField
        label="Documento de identidad"
        placeholder="Entre 6 y 10 dígitos"
        keyboardType="number-pad"
        value={personalData.documentId}
        onChangeText={(value) => updatePersonalData('documentId', value)}
        maxLength={10}
        error={errorFor('documentId')}
      />
      <FormField
        label="Número de celular"
        placeholder="10 dígitos"
        keyboardType="phone-pad"
        value={personalData.phone}
        onChangeText={(value) => updatePersonalData('phone', value)}
        maxLength={10}
        error={errorFor('phone')}
      />
      <DateField
        label="Fecha de nacimiento"
        value={personalData.birthDate}
        onChange={(value) => updatePersonalData('birthDate', value)}
        maximumDate={new Date()}
        error={errorFor('birthDate')}
      />
      <SelectField
        label="Género"
        options={GENDERS}
        value={personalData.gender}
        onChange={(value) => updatePersonalData('gender', value)}
        error={errorFor('gender')}
      />
      <FormField
        label="Correo electrónico"
        placeholder="nombre@dominio.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={personalData.email}
        onChangeText={(value) => updatePersonalData('email', value)}
        error={errorFor('email')}
      />
      <SelectField
        label="Idioma"
        options={LANGUAGES}
        value={personalData.language}
        onChange={(value) => updatePersonalData('language', value)}
        error={errorFor('language')}
      />
      <Pressable style={buttonStyles.button} onPress={handleNext}>
        <Text style={buttonStyles.text}>Siguiente</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
});
