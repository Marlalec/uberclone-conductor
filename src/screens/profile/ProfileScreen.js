import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import FormField from '../../components/FormField';
import SelectField from '../../components/SelectField';
import { buttonStyles, fieldStyles } from '../../components/formStyles';
import { CATEGORIES, LANGUAGES, VEHICLE_COLORS, optionLabel } from '../../config/options';
import { useDriver } from '../../context/DriverContext';
import { updateDriverProfile } from '../../services/driversService';
import { saveLanguage } from '../../services/storageService';
import { isValidEmail } from '../../utils/validators';

const PHONE_REGEX = /^\d{10}$/;

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { driver, driverId, logout } = useDriver();
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
        <ActivityIndicator size="large" color="#000" />
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
      nextErrors.phone = 'Debe ser numérico de 10 dígitos';
    }
    if (!isValidEmail(form.email)) {
      nextErrors.email = 'Ingresa un correo válido, por ejemplo nombre@dominio.com';
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
      await saveLanguage(form.language);
      setMessage('Datos actualizados');
    } catch {
      setErrors({ submit: 'No se pudieron guardar los cambios, intenta de nuevo' });
    } finally {
      setSaving(false);
    }
  };

  const documents = driver.documents;
  const inspection = documents?.technicalInspection;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Section title="Datos personales">
        <InfoRow label="Nombre" value={driver.fullName} />
        <InfoRow label="Documento" value={driver.documentId} />
        <FormField
          label="Número de celular"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(value) => updateForm('phone', value)}
          maxLength={10}
          error={errors.phone}
        />
        <FormField
          label="Correo electrónico"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={form.email}
          onChangeText={(value) => updateForm('email', value)}
          error={errors.email}
        />
        <SelectField
          label="Idioma"
          options={LANGUAGES}
          value={form.language}
          onChange={(value) => updateForm('language', value)}
        />
        <Pressable
          style={[buttonStyles.button, saving && buttonStyles.disabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={buttonStyles.text}>Guardar cambios</Text>}
        </Pressable>
        {message ? <Text style={styles.success}>{message}</Text> : null}
        {errors.submit ? <Text style={fieldStyles.error}>{errors.submit}</Text> : null}
      </Section>
      <Section title="Vehículo">
        <InfoRow label="Categoría" value={optionLabel(CATEGORIES, driver.vehicle.category)} />
        <InfoRow label="Placa" value={driver.vehicle.plate} />
        <InfoRow label="Marca y modelo" value={`${driver.vehicle.brand} ${driver.vehicle.model}`} />
        <InfoRow label="Año" value={String(driver.vehicle.year)} />
        <InfoRow label="Color" value={optionLabel(VEHICLE_COLORS, driver.vehicle.color)} />
        <InfoRow label="Capacidad" value={`${driver.vehicle.capacity} pasajeros`} />
      </Section>
      <Section title="Documentos">
        <InfoRow label="Licencia" value={documents?.license ? `${documents.license.number} · vence ${documents.license.expiresAt}` : 'Sin registrar'} />
        <InfoRow label="SOAT" value={documents?.soat ? `Vence ${documents.soat.expiresAt}` : 'Sin registrar'} />
        <InfoRow
          label="Revisión técnico-mecánica"
          value={inspection?.required ? `Vence ${inspection.expiresAt}` : 'No aplica por el año del vehículo'}
        />
        <InfoRow label="Correo de Mercado Pago" value={driver.paymentEmail ?? 'Sin registrar'} />
      </Section>
      <Pressable style={[buttonStyles.button, styles.logout]} onPress={logout}>
        <Text style={[buttonStyles.text, styles.logoutText]}>Cerrar sesión</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  infoRow: {
    gap: 2,
  },
  infoLabel: {
    fontSize: 13,
    color: '#555',
  },
  infoValue: {
    fontSize: 16,
    color: '#000',
  },
  success: {
    fontSize: 14,
    color: '#2e7d32',
  },
  logout: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d32f2f',
  },
  logoutText: {
    color: '#d32f2f',
  },
});
