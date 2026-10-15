import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import zh from './i18n/zh'
import en from './i18n/en'

// 平台启动时应用会据 sdk.settings.getLanguage() 调用 i18n.changeLanguage 覆盖此默认值
i18n.use(initReactI18next).init({
  resources: { zh: { translation: zh }, en: { translation: en } },
  lng: 'zh',
  fallbackLng: 'zh',
  interpolation: { escapeValue: false }
})

export default i18n
