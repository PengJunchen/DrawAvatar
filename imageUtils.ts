/**
 * 将File对象转换为数据URL
 * @param file 要转换的文件
 * @returns 包含数据URL和MIME类型的Promise
 */
export const fileToDataUrl = async (file: File): Promise<{ dataUrl: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const mimeMatch = dataUrl.match(/^data:([^;]+);/);
      const mimeType = mimeMatch ? mimeMatch[1] : file.type;
      resolve({ dataUrl, mimeType });
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * 将数据URL转换为File对象
 * @param dataUrl 数据URL
 * @param filename 文件名
 * @returns File对象
 */
export const dataUrlToFile = (dataUrl: string, filename: string): File => {
  const arr = dataUrl.split(',');
  if (arr.length < 2) throw new Error("无效的数据URL");
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch || !mimeMatch[1]) throw new Error("无法从数据URL解析MIME类型");

  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while(n--){
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, {type:mime});
};

/**
 * 检查图像尺寸是否符合要求
 * @param file 图像文件
 * @param minWidth 最小宽度
 * @param minHeight 最小高度
 * @returns Promise<boolean>
 */
export const checkImageDimensions = (file: File, minWidth: number, minHeight: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img.width >= minWidth && img.height >= minHeight);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      resolve(false);
    };
    img.src = URL.createObjectURL(file);
  });
};

/**
 * 裁剪图像
 * @param imageUrl 图像URL
 * @param crop 裁剪区域
 * @param type 裁剪类型（矩形或圆形）
 * @returns 裁剪后的图像数据URL
 */
export const cropImage = (
  imageUrl: string,
  crop: { x: number; y: number; width: number; height: number },
  type: 'rect' | 'circle' = 'rect'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('无法创建Canvas上下文'));
        return;
      }
      
      if (type === 'circle') {
        ctx.beginPath();
        ctx.arc(
          crop.width / 2,
          crop.height / 2,
          Math.min(crop.width, crop.height) / 2,
          0,
          2 * Math.PI
        );
        ctx.clip();
      }
      
      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );
      
      resolve(canvas.toDataURL('image/png'));
    };
    
    image.onerror = () => {
      reject(new Error('图像加载失败'));
    };
    
    image.src = imageUrl;
  });
};