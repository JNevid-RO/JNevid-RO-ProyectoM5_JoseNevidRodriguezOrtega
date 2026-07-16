export async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Utilizar POST.' });
  }

  try {
    const { filename, contentType } = req.body || {};

    if (!filename || !contentType) {
      return res.status(400).json({ error: 'Parametros filename y contentType requeridos.' });
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME || 'ecommerce-products-bucket';
    const region = process.env.AWS_REGION || 'us-east-1';
    const fileKey = `products/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const uploadUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileKey}?presigned-mock-token=${Date.now()}`;
    const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileKey}`;

    return res.status(200).json({
      uploadUrl,
      publicUrl,
      fileKey,
    });
  } catch (error: any) {
    console.error('Error generando Presigned URL:', error);
    return res.status(500).json({ error: 'Error interno al generar URL de carga.' });
  }
}

export default handler;
