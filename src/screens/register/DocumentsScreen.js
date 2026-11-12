import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import FormField from '../../components/FormField';
import DateField from '../../components/DateField';
import PhotoField from '../../components/PhotoField';
import CheckboxField from '../../components/CheckboxField';
import { buttonStyles, fieldStyles } from '../../components/formStyles';
import { useRegister } from '../../context/RegisterContext';
import { useDriver } from '../../context/DriverContext';
import { COMMISSION_RATE } from '../../config/pricing';
import { getTomorrow } from '../../utils/dates';
import { requiresTechnicalInspection } from '../../utils/validators';
import { DRIVER_EXISTS_ERROR, registerDriver } from '../../services/driversService';
import { UPLOAD_ERROR } from '../../services/cloudinaryService';

const COMMISSION_PERCENT = Math.round(COMMISSION_RATE * 100);

const SUBMIT_ERRORS = {
  [DRIVER_EXISTS_ERROR]: 'Ya existe un conductor registrado con ese documento',
  [UPLOAD_ERROR]: 'No se pudieron subir las fotos, revisa tu conexión e intenta de nuevo',
};

const DEFAULT_SUBMIT_ERROR = 'No se pudo enviar el registro, revisa tu conexión e intenta de nuevo';

export default function DocumentsScreen() {
  const {
    personalData,
    vehicle,
    documents,
    vehicleErrors,
    documentErrors,
    touched,
    isPersonalValid,
    isVehicleValid,
    isDocumentsValid,
    updateDocuments,
    resetRegister,
  } = useRegister();
  const { startSession } = useDriver();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const errorFor = (field) => (touched[field] ? documentErrors[field] : undefined);
  const needsInspection = requiresTechnicalInspection(vehicle.year);
  const minimumExpiry = getTomorrow();
  const canSubmit = isPersonalValid && isVehicleValid && isDocumentsValid && !submitting;

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const driverId = await registerDriver({ personalData, vehicle, documents });
      await startSession(driverId, personalData.language);
      resetRegister();
    } catch (error) {
      setSubmitError(SUBMIT_ERRORS[error.message] ?? DEFAULT_SUBMIT_ERROR);
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
      <Text style={styles.section}>Licencia de conducción</Text>
      <FormField
        label="Número de licencia"
        placeholder="Entre 6 y 10 dígitos"
        keyboardType="number-pad"
        value={documents.licenseNumber}
        onChangeText={(value) => updateDocuments('licenseNumber', value)}
        maxLength={10}
        error={errorFor('licenseNumber')}
      />
      <PhotoField
        label="Foto de la licencia"
        value={documents.licensePhoto}
        onChange={(value) => updateDocuments('licensePhoto', value)}
        error={errorFor('licensePhoto')}
      />
      <DateField
        label="Fecha de vencimiento de la licencia"
        value={documents.licenseExpiry}
        onChange={(value) => updateDocuments('licenseExpiry', value)}
        minimumDate={minimumExpiry}
        error={errorFor('licenseExpiry')}
      />

      <Text style={styles.section}>SOAT</Text>
      <PhotoField
        label="Foto del SOAT"
        value={documents.soatPhoto}
        onChange={(value) => updateDocuments('soatPhoto', value)}
        error={errorFor('soatPhoto')}
      />
      <DateField
        label="Fecha de vencimiento del SOAT"
        value={documents.soatExpiry}
        onChange={(value) => updateDocuments('soatExpiry', value)}
        minimumDate={minimumExpiry}
        error={errorFor('soatExpiry')}
      />

      <Text style={styles.section}>Revisión técnico-mecánica</Text>
      {vehicleErrors.year ? (
        <Text style={styles.note}>Completa el año del vehículo en la pestaña Vehículo para saber si aplica.</Text>
      ) : null}
      {!vehicleErrors.year && !needsInspection ? (
        <Text style={styles.note}>Por el año de tu vehículo aún no requieres revisión técnico-mecánica.</Text>
      ) : null}
      {needsInspection ? (
        <>
          <PhotoField
            label="Foto de la revisión técnico-mecánica"
            value={documents.technicalInspectionPhoto}
            onChange={(value) => updateDocuments('technicalInspectionPhoto', value)}
            error={errorFor('technicalInspectionPhoto')}
          />
          <DateField
            label="Fecha de vencimiento de la revisión"
            value={documents.technicalInspectionExpiry}
            onChange={(value) => updateDocuments('technicalInspectionExpiry', value)}
            minimumDate={minimumExpiry}
            error={errorFor('technicalInspectionExpiry')}
          />
        </>
      ) : null}

      <Text style={styles.section}>Pagos</Text>
      <FormField
        label="Correo de la cuenta de Mercado Pago"
        placeholder="nombre@dominio.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={documents.paymentEmail}
        onChangeText={(value) => updateDocuments('paymentEmail', value)}
        error={errorFor('paymentEmail')}
      />
      <CheckboxField
        label={`Acepto los términos y condiciones. La plataforma cobra una comisión del ${COMMISSION_PERCENT} % sobre la tarifa de cada viaje.`}
        value={documents.termsAccepted}
        onChange={(value) => updateDocuments('termsAccepted', value)}
        error={errorFor('termsAccepted')}
      />

      {!isPersonalValid ? (
        <Text style={fieldStyles.error}>Completa correctamente la pestaña Datos personales</Text>
      ) : null}
      {!isVehicleValid ? <Text style={fieldStyles.error}>Completa correctamente la pestaña Vehículo</Text> : null}
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
  section: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
    marginTop: 8,
    marginBottom: 12,
  },
  note: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
  },
});
