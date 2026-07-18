import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Utilizar POST.' });
  }

  try {
    const { filename, contentType } = req.body || {};

    if (!filename || !contentType) {
      return res.status(400).json({ error: 'Parametros filename y contentType requeridos.' });
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) {
      return res.status(500).json({ error: 'AWS_S3_BUCKET_NAME no esta configurado en las variables de entorno.' });
    }

    const fileKey = `products/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ContentType: contentType,
    });

    // Genera una presigned URL valida por 5 minutos (300 segundos)
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    const region = process.env.AWS_REGION || 'us-east-1';
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
