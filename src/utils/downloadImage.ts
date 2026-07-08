export async function downloadImage(warpedImage: HTMLImageElement | null) {
  if (!warpedImage) return;
  // Convert the data URL to a blob by hand (not via fetch()) — WebKit
  // (Safari and all iOS browsers) throws on fetch() of a data: URL.
  const [header, base64] = warpedImage.src.split(',');
  const mime = header.match(/data:(.*?);base64/)?.[1] ?? 'image/png';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: mime });
  const file = new File([blob], 'card.png', { type: mime });

  // Prefer the native share sheet (saves straight to Photos on iOS) when available
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (err) {
      // User cancelled the share sheet — leave it there, don't force a download too
      if (err instanceof Error && err.name === 'AbortError') return;
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'card.png';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
