/**
 * Utility to reliably trigger in-browser download of zip packages
 * Uses Blob and object URL to bypass iframe navigation restrictions and 404s
 */
export async function downloadZipFile(filename = 'radiantspark-final.zip'): Promise<boolean> {
  try {
    const res = await fetch(`/${filename}?t=${Date.now()}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${filename}: status ${res.status}`);
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 200);
    return true;
  } catch (err) {
    console.error('Blob download fallback:', err);
    // Direct link fallback
    const fallbackLink = document.createElement('a');
    fallbackLink.href = `/${filename}`;
    fallbackLink.download = filename;
    document.body.appendChild(fallbackLink);
    fallbackLink.click();
    setTimeout(() => document.body.removeChild(fallbackLink), 200);
    return false;
  }
}
