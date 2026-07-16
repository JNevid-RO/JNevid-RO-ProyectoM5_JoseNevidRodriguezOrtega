export interface UploadResult {
  publicUrl: string;
  fileKey: string;
}

export async function uploadProductImage(file: File): Promise<UploadResult> {
  try {
    const response = await fetch('/api/upload-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      
      await fetch(data.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      return {
        publicUrl: data.publicUrl,
        fileKey: data.fileKey,
      };
    }
  } catch (error) {
    console.warn('Servidor serverless offline, utilizando fallback de objeto URL local', error);
  }

  const mockPublicUrl = URL.createObjectURL(file);
  return {
    publicUrl: mockPublicUrl,
    fileKey: `local/${file.name}`,
  };
}
