import { registerRootComponent } from 'expo';
import codePush from "react-native-code-push";
import App from './App';
import { CODE_PUSH_DEPLOYMENT_KEY } from "@env";
import { AppI18n } from './localize';

const codePushOptions = {
  updateDialog: {
    optionalUpdateMessage : AppI18n.t('update.optionalUpdateMessage'),
    optionalInstallButtonLabel : AppI18n.t('update.optionalInstallButtonLabel'),
    optionalIgnoreButtonLabel : AppI18n.t('update.optionalIgnoreButtonLabel'),
    title: AppI18n.t('update.title'),
  },
  deploymentKey: CODE_PUSH_DEPLOYMENT_KEY,
};
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(codePush(codePushOptions)(App));
