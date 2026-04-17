declare module '@docren/react-native-markdown' {
  import { ReactNode } from 'react';
  import { StyleProp, TextStyle, ViewStyle } from 'react-native';

  export interface MarkdownProps {
    markdown: string;
    styles?: {
      text?: StyleProp<TextStyle>;
      view?: StyleProp<ViewStyle>;
      [key: string]: any;
    };
  }

  export const Markdown: React.FC<MarkdownProps>;
}
