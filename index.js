import { registerRootComponent } from 'expo';
import App from './App';
import { registerBackgroundMessageHandler } from './src/services/notificationsService';

registerBackgroundMessageHandler();
registerRootComponent(App);
