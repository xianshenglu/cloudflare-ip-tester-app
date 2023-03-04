import { registerRootComponent } from 'expo';
import codePush from "react-native-code-push";
import App from './App';

loadDevEnv();

const codePushOptions = {
  updateDialog: true,
  deploymentKey: process.env.CODE_PUSH_DEPLOYMENT_KEY,
};
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(codePush(codePushOptions)(App));

function loadDevEnv() {
  if (!process.env.NODE_ENV) {
    dotenv.config();
  }
}