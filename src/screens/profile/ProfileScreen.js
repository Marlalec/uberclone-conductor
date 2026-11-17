import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import FormField from '../../components/FormField';
import SelectField from '../../components/SelectField';
import { buttonStyles, fieldStyles } from '../../components/formStyles';
import { CATEGORIES, LANGUAGES, VEHICLE_COLORS, optionLabel } from '../../config/options';
import { useDriver } from '../../context/DriverContext';
import { useLanguage } from '../../context/LanguageContext';
import { updateDriverProfile } from '../../services/driversService';
import { isValidEmail } from '../../utils/validators';
import { colors, radius } from '../../theme';

const PHONE_REGEX = /^\d{10}$/;

function Section({ title, children }) {
  const { t } = useLanguage();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t(title)}</Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value }) {
  const { t } = useLanguage();

  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{t(label)}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { driver, driverId, logout } = useDriver();
  const { t, changeLanguage } = useLanguage();
  const [form, setForm] = useState({ phone: '', email: '', language: 'es' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (driver) {
      setForm({ phone: driver.phone, email: driver.email, language: driver.language });
    }
  }, [driver?.phone, driver?.email, driver?.language]);

  if (!driver) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.ink} />
      </View>
    );
  }

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setMessage('');
  };

  const validate = () => {
    const nextErrors = {};
    if (!PHONE_REGEX.test(form.phone)) {
      nextErrors.phone = 'validation.phoneDigits';
    }
    if (!isValidEmail(form.email)) {
      nextErrors.email = 'validation.emailInvalid';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      await updateDriverProfile(driverId, form);
      await changeLanguage(form.language);
      setMessage('profile.saved');
    } catch {
      setErrors({ submit: 'profile.errors.save' });
    } finally {
      setSaving(false);
    }
  };

  const documents = driver.documents;
  const inspection = documents?.technicalInspection;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Section title="profile.personalSection">
        <InfoRow label="profile.name" value={driver.fullName} />
        <InfoRow label="profile.document" value={driver.documentId} />
        <FormField
          label="register.phone"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(value) => updateForm('phone', value)}
          maxLength={10}
          error={errors.phone}
        />
        <FormField
          label="register.email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={form.email}
          onChangeText={(value) => updateForm('email', value)}
          error={errors.email}
        />
        <SelectField
          label="register.language"
          options={LANGUAGES}
          value={form.language}
          onChange={(value) => updateForm('language', value)}
        />
        <Pressable
          style={[buttonStyles.button, saving && buttonStyles.disabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color={colors.surface} /> : <Text style={buttonStyles.text}>{t('profile.save')}</Text>}
        </Pressable>
        {message ? <Text style={styles.success}>{t(message)}</Text> : null}
        {errors.submit ? <Text style={fieldStyles.error}>{t(errors.submit)}</Text> : null}
      </Section>
      <Section title="profile.vehicleSection">
        <InfoRow label="register.category" value={t(optionLabel(CATEGORIES, driver.vehicle.category))} />
        <InfoRow label="register.plate" value={driver.vehicle.plate} />
        <InfoRow label="profile.brandModel" value={`${driver.vehicle.brand} ${driver.vehicle.model}`} />
        <InfoRow label="register.year" value={String(driver.vehicle.year)} />
        <InfoRow label="register.color" value={t(optionLabel(VEHICLE_COLORS, driver.vehicle.color))} />
        <InfoRow label="profile.capacity" value={t('profile.passengers', { count: driver.vehicle.capacity })} />
      </Section>
      <Section title="profile.documentsSection">
        <InfoRow
          label="profile.license"
          value={
            documents?.license
              ? t('profile.licenseValue', { number: documents.license.number, date: documents.license.expiresAt })
              : t('common.notRegistered')
          }
        />
        <InfoRow
          label="SOAT"
          value={documents?.soat ? t('profile.expires', { date: documents.soat.expiresAt }) : t('common.notRegistered')}
        />
        <InfoRow
          label="register.inspectionSection"
          value={inspection?.required ? t('profile.expires', { date: inspection.expiresAt }) : t('profile.inspectionNotRequired')}
        />
        <InfoRow label="profile.paymentEmail" value={driver.paymentEmail ?? t('common.notRegistered')} />
      </Section>
      <Pressable style={[buttonStyles.button, styles.logout]} onPress={logout}>
        <Text style={[buttonStyles.text, styles.logoutText]}>{t('profile.logout')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 20,
    backgroundColor: colors.background,
    flexGrow: 1,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    gap: 12,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  infoRow: {
    gap: 2,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: 16,
    color: colors.ink,
  },
  success: {
    fontSize: 14,
    color: colors.success,
  },
  logout: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  logoutText: {
    color: colors.danger,
  },
});
