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
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../theme';

const COMMISSION_PERCENT = Math.round(COMMISSION_RATE * 100);

const SUBMIT_ERRORS = {
  [DRIVER_EXISTS_ERROR]: 'register.errors.driverExists',
  [UPLOAD_ERROR]: 'register.errors.upload',
};

const DEFAULT_SUBMIT_ERROR = 'register.errors.submit';

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
  const { t } = useLanguage();
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
      console.error('registerDriver', error.message, error.cause ?? '');
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
      <Text style={styles.section}>{t('register.licenseSection')}</Text>
      <FormField
        label="register.licenseNumber"
        placeholder="register.digits6to10"
        keyboardType="number-pad"
        value={documents.licenseNumber}
        onChangeText={(value) => updateDocuments('licenseNumber', value)}
        maxLength={10}
        error={errorFor('licenseNumber')}
      />
      <PhotoField
        label="register.licensePhoto"
        value={documents.licensePhoto}
        onChange={(value) => updateDocuments('licensePhoto', value)}
        error={errorFor('licensePhoto')}
      />
      <DateField
        label="register.licenseExpiry"
        value={documents.licenseExpiry}
        onChange={(value) => updateDocuments('licenseExpiry', value)}
        minimumDate={minimumExpiry}
        error={errorFor('licenseExpiry')}
      />

      <Text style={styles.section}>SOAT</Text>
      <PhotoField
        label="register.soatPhoto"
        value={documents.soatPhoto}
        onChange={(value) => updateDocuments('soatPhoto', value)}
        error={errorFor('soatPhoto')}
      />
      <DateField
        label="register.soatExpiry"
        value={documents.soatExpiry}
        onChange={(value) => updateDocuments('soatExpiry', value)}
        minimumDate={minimumExpiry}
        error={errorFor('soatExpiry')}
      />

      <Text style={styles.section}>{t('register.inspectionSection')}</Text>
      {vehicleErrors.year ? (
        <Text style={styles.note}>{t('register.inspectionNeedsYear')}</Text>
      ) : null}
      {!vehicleErrors.year && !needsInspection ? (
        <Text style={styles.note}>{t('register.inspectionNotRequired')}</Text>
      ) : null}
      {needsInspection ? (
        <>
          <PhotoField
            label="register.inspectionPhoto"
            value={documents.technicalInspectionPhoto}
            onChange={(value) => updateDocuments('technicalInspectionPhoto', value)}
            error={errorFor('technicalInspectionPhoto')}
          />
          <DateField
            label="register.inspectionExpiry"
            value={documents.technicalInspectionExpiry}
            onChange={(value) => updateDocuments('technicalInspectionExpiry', value)}
            minimumDate={minimumExpiry}
            error={errorFor('technicalInspectionExpiry')}
          />
        </>
      ) : null}

      <Text style={styles.section}>{t('register.paymentsSection')}</Text>
      <FormField
        label="register.paymentEmail"
        placeholder="nombre@dominio.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={documents.paymentEmail}
        onChangeText={(value) => updateDocuments('paymentEmail', value)}
        error={errorFor('paymentEmail')}
      />
      <CheckboxField
        label={{ key: 'register.terms', params: { percent: COMMISSION_PERCENT } }}
        value={documents.termsAccepted}
        onChange={(value) => updateDocuments('termsAccepted', value)}
        error={errorFor('termsAccepted')}
      />

      {!isPersonalValid ? (
        <Text style={fieldStyles.error}>{t('register.completePersonal')}</Text>
      ) : null}
      {!isVehicleValid ? <Text style={fieldStyles.error}>{t('register.completeVehicle')}</Text> : null}
      <Pressable
        style={[buttonStyles.button, !canSubmit && buttonStyles.disabled]}
        onPress={handleSubmit}
        disabled={!canSubmit}
      >
        {submitting ? <ActivityIndicator color={colors.surface} /> : <Text style={buttonStyles.text}>{t('register.submit')}</Text>}
      </Pressable>
      {submitError ? <Text style={fieldStyles.error}>{t(submitError)}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: colors.background,
  },
  section: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink,
    marginTop: 8,
    marginBottom: 12,
  },
  note: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 16,
  },
});
