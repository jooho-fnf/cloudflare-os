export type Locale = 'en' | 'ko'

export type MessageTree = { readonly [key: string]: string | MessageTree }

export type TranslateVars = Record<string, string | number>
