import { NextResponse, type NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifySessionToken } from '@/lib/admin/auth';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const sessionToken = request.cookies.get('admin_session')?.value;
    const { valid } = await verifySessionToken(sessionToken);
    if (!valid) {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere iniciar sesión como administrador.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo.' }, { status: 400 });
    }

    // Validación estricta de tipo MIME
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Formato no soportado. Subí imágenes JPG, PNG, WEBP, GIF o AVIF.' },
        { status: 400 }
      );
    }

    // Validación de tamaño (máximo 10 MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'El archivo excede el tamaño máximo permitido (10 MB).' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Sanitización y nombre único seguro
    const originalExt = path.extname(file.name) || '.jpg';
    const cleanBase = path.basename(file.name, originalExt).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 30);
    const fileName = `${cleanBase || 'img'}-${Date.now()}${originalExt.toLowerCase()}`;
    const filePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;
    return NextResponse.json({ success: true, url: publicUrl, name: fileName });
  } catch (error: any) {
    console.error('Error al subir imagen:', error);
    return NextResponse.json(
      { error: error?.message || 'Error del servidor al procesar la imagen.' },
      { status: 500 }
    );
  }
}
