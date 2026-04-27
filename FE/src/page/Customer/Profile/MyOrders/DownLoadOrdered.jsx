import { toPng } from "html-to-image";

/**
 * Tải về hình ảnh của một node DOM (thẻ vé)
 * @param {HTMLElement} node - DOM node cần chụp
 * @param {string} fileName - Tên file tải về
 */
export const handleDownloadTicket = async (node, fileName = "ve_xem_phim.png") => {
  if (!node) return;
  try {
    const dataUrl = await toPng(node, { cacheBust: true, backgroundColor: "#fff" });
    const link = document.createElement("a");
    link.download = fileName;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    alert("Không thể tải thẻ mã vé. Vui lòng thử lại!");
  }
};