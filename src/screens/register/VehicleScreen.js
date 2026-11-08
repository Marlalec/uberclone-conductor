import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import FormField from '../../components/FormField';
import SelectField from '../../components/SelectField';
import PhotoField from '../../components/PhotoField';
import { buttonStyles, fieldStyles } from '../../components/formStyles';
import { useRegister } from '../../context/RegisterContext';
import { CATEGORIES, VEHICLE_COLORS } from '../../config/options';
import { DRIVER_EXISTS_ERROR, registerDriver } from '../../services/driversService';

export default function VehicleScreen({ navigation }) {
  const {
    personalData,
    vehicle,
    vehicleErrors,
    touched,
    isPersonalValid,
    isVehicleValid,
    updateVehicle,
    resetRegister,
  } = useRegister();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const errorFor = (field) => (touched[field] ? vehicleErrors[field] : undefined);
  const canSubmit = isPersonalValid && isVehicleValid && !submitting;

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      await registerDriver({ personalData, vehicle });
      resetRegister();
      navigation.getParent()?.replace('Main', { screen: 'Home', params: { registered: true } });
    } catch (error) {
      setSubmitError(
        error.message === DRIVER_EXISTS_ERROR
          ? 'Ya existe un conductor registrado con ese documento'
          : 'No se pudo enviar el registro, revisa tu conexión e intenta de nuevo'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <SelectField
        label="Categoría"
        options={CATEGORIES}
        value={vehicle.category}
        onChange={(value) => updateVehicle('category', value)}
        error={errorFor('category')}
      />
      <FormField
        label="Placa"
        placeholder="ABC123"
        autoCapitalize="characters"
        autoCorrect={false}
        value={vehicle.plate}
        onChangeText={(value) => updateVehicle('plate', value.toUpperCase())}
        maxLength={6}
        error={errorFor('plate')}
      />
      <FormField
        label="Marca"
        placeholder="Ej: Chevrolet"
        value={vehicle.brand}
        onChangeText={(value) => updateVehicle('brand', value)}
        maxLength={30}
        error={errorFor('brand')}
      />
      <FormField
        label="Modelo"
        placeholder="Ej: Onix"
        value={vehicle.model}
        onChangeText={(value) => updateVehicle('model', value)}
        maxLength={30}
        error={errorFor('model')}
      />
      <FormField
        label="Año"
        placeholder="Ej: 2020"
        keyboardType="number-pad"
        value={vehicle.year}
        onChangeText={(value) => updateVehicle('year', value)}
        maxLength={4}
        error={errorFor('year')}
      />
      <SelectField
        label="Color"
        options={VEHICLE_COLORS}
        value={vehicle.color}
        onChange={(value) => updateVehicle('color', value)}
        error={errorFor('color')}
      />
      <FormField
        label="Capacidad de pasajeros"
        placeholder="Ej: 4"
        keyboardType="number-pad"
        value={vehicle.capacity}
        onChangeText={(value) => updateVehicle('capacity', value)}
        maxLength={2}
        error={errorFor('capacity')}
      />
      <PhotoField
        label="Foto del vehículo (debe verse la placa)"
        value={vehicle.vehiclePhoto}
        onChange={(value) => updateVehicle('vehiclePhoto', value)}
        error={errorFor('vehiclePhoto')}
      />
      {!isPersonalValid ? (
        <Text style={fieldStyles.error}>Completa correctamente la pestaña Datos personales</Text>
      ) : null}
      <Pressable
        style={[buttonStyles.button, !canSubmit && buttonStyles.disabled]}
        onPress={handleSubmit}
        disabled={!canSubmit}
      >
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={buttonStyles.text}>Enviar registro</Text>}
      </Pressable>
      {submitError ? <Text style={fieldStyles.error}>{submitError}</Text> : null}
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
