/**
 * Comprime uma imagem base64 redimensionando e aplicando compressão JPEG.
 * Funciona tanto na Web (Canvas API) quanto no React Native.
 * 
 * Para OCR de receitas, 1200px de largura com qualidade 0.7 é suficiente
 * para manter o texto legível e reduzir o payload de ~10MB para ~200-400KB.
 */

const MAX_WIDTH = 2200;
const MAX_HEIGHT = 3000;
const JPEG_QUALITY = 0.92;

/**
 * Redimensiona e comprime uma imagem base64 usando Canvas (web).
 * Retorna o base64 puro (sem prefixo data:image).
 */
export async function compressBase64Image(base64: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.onload = () => {
        // Calcular novas dimensões mantendo aspect ratio
        let { width, height } = img;
        
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }

        // Criar canvas e desenhar imagem redimensionada
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context not available'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Exportar como JPEG comprimido (sem o prefixo data:image/jpeg;base64,)
        const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
        const compressedBase64 = dataUrl.split(',')[1];
        
        console.log(`[ImageCompress] ${img.naturalWidth}x${img.naturalHeight} → ${width}x${height} | ~${Math.round(compressedBase64.length / 1024)}KB`);
        
        resolve(compressedBase64);
      };
      
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      
      // Adicionar prefixo se necessário
      if (base64.startsWith('data:')) {
        img.src = base64;
      } else {
        img.src = `data:image/jpeg;base64,${base64}`;
      }
    } catch (error) {
      // Se Canvas não estiver disponível (ex: ambiente Node), retorna original
      console.warn('[ImageCompress] Canvas not available, returning original');
      resolve(base64);
    }
  });
}
