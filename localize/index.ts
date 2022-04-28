import I18n from "i18n-js";
import * as RNLocalize from "react-native-localize";
import cn from "../lang/zh-cn.json";
import en from "../lang/en-us.json";

// 获取手机本地国际化信息
const locales = RNLocalize.getLocales();
const systemLanguage = locales[0]?.languageCode; // 用户系统偏好语言

// 如果获取到了即使用，否则启用默认语言
if (systemLanguage) {
  I18n.locale = systemLanguage;
} else {
  I18n.locale = "en"; // 用户既没有设置，也没有获取到系统语言，默认加载英语语言资源
}

I18n.fallbacks = true;

// 加载语言包
I18n.translations = {
  zh: cn,
  cn,
  en,
};

export { I18n };
