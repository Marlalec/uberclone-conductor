import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import FormField from '../../components/FormField';
import SelectField from '../../components/SelectField';
import PhotoField from '../../components/PhotoField';
import { buttonStyles } from '../../components/formStyles';
import { useRegister } from '../../context/RegisterContext';
import { CATEGORIES, VEHICLE_COLORS } from '../../config/options';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../theme';

export const VEHICLE_FIELDS = ['category', 'plate', 'brand', 'model', 'year', 'color', 'capacity', 'vehiclePhoto'];

export default function VehicleScreen({ navigation }) {
  const { vehicle, vehicleErrors, touched, isVehicleValid, updateVehicle, touchFields } = useRegister();

  const { t } = useLanguage();

  const errorFor = (field) => (touched[field] ? vehicleErrors[field] : undefined);

  const handleNext = () => {
    touchFields(VEHICLE_FIELDS);
    if (isVehicleValid) {
      navigation.navigate('Documents');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <SelectField
        label="register.category"
        options={CATEGORIES}
        value={vehicle.category}
        onChange={(value) => updateVehicle('category', value)}
        error={errorFor('category')}
      />
      <FormField
        label="register.plate"
        placeholder="ABC123"
        autoCapitalize="characters"
        autoCorrect={false}
        value={vehicle.plate}
        onChangeText={(value) => updateVehicle('plate', value.toUpperCase())}
        maxLength={6}
        error={errorFor('plate')}
      />
      <FormField
        label="register.brand"
        placeholder="register.brandPlaceholder"
        value={vehicle.brand}
        onChangeText={(value) => updateVehicle('brand', value)}
        maxLength={30}
        error={errorFor('brand')}
      />
      <FormField
        label="register.model"
        placeholder="register.modelPlaceholder"
        value={vehicle.model}
        onChangeText={(value) => updateVehicle('model', value)}
        maxLength={30}
        error={errorFor('model')}
      />
      <FormField
        label="register.year"
        placeholder="register.yearPlaceholder"
        keyboardType="number-pad"
        value={vehicle.year}
        onChangeText={(value) => updateVehicle('year', value)}
        maxLength={4}
        error={errorFor('year')}
      />
      <SelectField
        label="register.color"
        options={VEHICLE_COLORS}
        value={vehicle.color}
        onChange={(value) => updateVehicle('color', value)}
        error={errorFor('color')}
      />
      <FormField
        label="register.capacity"
        placeholder="register.capacityPlaceholder"
        keyboardType="number-pad"
        value={vehicle.capacity}
        onChangeText={(value) => updateVehicle('capacity', value)}
        maxLength={2}
        error={errorFor('capacity')}
      />
      <PhotoField
        label="register.vehiclePhoto"
        value={vehicle.vehiclePhoto}
        onChange={(value) => updateVehicle('vehiclePhoto', value)}
        error={errorFor('vehiclePhoto')}
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
