import { Platform } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Otimiza uma imagem (redimensiona e comprime) para OCR.
 * Funciona tanto no App (ImageManipulator) quanto na Web (Canvas).
 * @param uri Caminho da imagem (file:// ou http://)
 * @returns Base64 comprimida (sem prefixo)
 */
export async function compressImageToPurifiedBase64(uri: string): Promise<string> {
  const MAX_WIDTH = 1600;
  const JPEG_QUALITY = 0.75;

  if (Platform.OS === 'web') {
    // Lógica Web usando Canvas
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context error'));
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
        resolve(dataUrl.split(',')[1]);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = uri;
    });
  } else {
    // Lógica Nativa (iOS/Android) usando Expo Image Manipulator
    // Comprime DIRETAMENTE do arquivo, economizando MUITA memória no iPhone
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: MAX_WIDTH } }],
      { compress: JPEG_QUALITY, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    return result.base64 || '';
  }
}
