export const colors = {
  primaryDark: '#075E54',
  primary: '#128C7E',
  primaryLight: '#25D366',
  sentBubble: '#DCF8C6',
  receivedBubble: '#FFFFFF',
  chatBg: '#ECE5DD',
  textPrimary: '#111B21',
  textSecondary: '#667781',
  divider: '#E9EDEF',
  authGradientStart: '#075E54',
  authGradientEnd: '#128C7E',
  error: '#dc2626',
  errorBg: '#fee2e2',
  white: '#FFFFFF',
  black: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 32,
};

export const typography = {
  logo: { fontSize: 36, fontWeight: '800' as const },
  title: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16 },
  caption: { fontSize: 13 },
  small: { fontSize: 11 },
};

export const avatarColors = [
  '#25D366', '#128C7E', '#075E54', '#0084ff',
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#FF7675', '#74B9FF',
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}
