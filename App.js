import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { RegisterProvider } from './src/context/RegisterContext';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RegisterProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </RegisterProvider>
    </GestureHandlerRootView>
  );
}
