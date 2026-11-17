import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { RegisterProvider } from './src/context/RegisterContext';
import { DriverProvider } from './src/context/DriverContext';
import { LanguageProvider } from './src/context/LanguageContext';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LanguageProvider>
        <DriverProvider>
          <RegisterProvider>
            <AppNavigator />
            <StatusBar style="dark" />
          </RegisterProvider>
        </DriverProvider>
      </LanguageProvider>
    </GestureHandlerRootView>
  );
}
