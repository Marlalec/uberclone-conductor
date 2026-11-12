import PlaceholderScreen from '../../components/PlaceholderScreen';
import { useDriver } from '../../context/DriverContext';

export default function ProfileScreen() {
  const { logout } = useDriver();

  return <PlaceholderScreen title="Perfil y configuración" actions={[{ label: 'Cerrar sesión', onPress: logout }]} />;
}
