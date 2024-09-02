import { NextResponse } from 'next/server';
import Busboy from 'busboy';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import {db} from '@/db'; // Assuming you have a prisma instance in your project

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed for File Upload' }, { status: 405 });
  }

  const busboy = Busboy({ headers: { 'content-type': req.headers.get('Content-Type') || '' } });
  const fileUploadPromises: Promise<void>[] = [];
  let filename: string | undefined;

  busboy.on('file', (fieldname, file, fileinfo, encoding, mimetype) => {
    filename = fileinfo.filename;

    if (!filename) {
      console.error('Filename is not provided');
      return;
    }

    const saveTo = path.join(process.cwd(), 'public/uploads', filename);
    const writeStream = fs.createWriteStream(saveTo);
    file.pipe(writeStream);

    fileUploadPromises.push(
      new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      })
    );
  });

  busboy.on('finish', async () => {
    if (filename) {
      // Assuming userId is sent as a query parameter
      const userId = new URL(req.url).searchParams.get('userId');
      if (userId) {
        try {
          // Update user's image field in the database
          await db.user.update({
            where: { id: userId },
            data: { image: `/uploads/${filename}` },
          });
        } catch (error) {
          console.error('Error updating user image:', error);
          return NextResponse.json({ error: 'Failed to update user image' }, { status: 500 });
        }
      }
    }
  });

  busboy.on('error', (err) => {
    console.error('Upload error:', err);
    throw err;
  });

  const readableStream = new Readable({
    read() {}
  });

  req.body.pipeTo(
    new WritableStream({
      write(chunk) {
        readableStream.push(Buffer.from(chunk));
      },
      close() {
        readableStream.push(null);
      },
      abort(err) {
        console.error('Stream error:', err);
        readableStream.destroy(err);
      },
    })
  );

  readableStream.pipe(busboy);
  await Promise.all(fileUploadPromises);

  return NextResponse.json({ message: 'File(s) uploaded and user image updated successfully' }, { status: 200 });
}
