/**
 * 导出食物网配置为 JSON 文件并触发下载
 * @param {Object} data - 包含 species, links, envParams 的对象
 */
export function exportFoodWeb(data) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `foodweb-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 读取用户上传的 JSON 文件并解析
 * @param {File} file - 文件对象
 * @returns {Promise<Object>} 解析后的食物网配置
 */
export function importFoodWeb(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        // 简单校验结构
        if (!data.species || !data.links || !data.envParams) {
          throw new Error('JSON 文件缺少 species / links / envParams 字段');
        }
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
}