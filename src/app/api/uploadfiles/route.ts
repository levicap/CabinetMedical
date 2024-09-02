import { NextResponse,NextRequest } from 'next/server';
import Busboy from 'busboy';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { db } from '@/db';
import archiver from 'archiver';
import { PassThrough } from 'stream';
export const config = {
    api: {
      bodyParser: false,
    },
  };
  
  export async function POST(req: Request) {
    if (req.method !== 'POST') {
      return NextResponse.json({ error: 'Method not allowed for File Upload' }, { status: 405 });
     
    }
    const url = new URL(req.url);
    const dossierId = url.searchParams.get('dossierId');
  
    const busboy = Busboy({ headers: { 'content-type': req.headers.get('Content-Type') || '' } });
    const fileUploadPromises: Promise<void>[] = [];
    const uploadedFiles: string[] = []; // Array to store filenames
  
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      if (typeof filename === 'object' && filename.filename) {
        filename = filename.filename;
      }
  
      if (typeof filename !== 'string') {
        console.error('Filename is not a string:', filename);
        return;
      }
  
      const saveTo = path.join(process.cwd(), 'public/uploads', filename);
      const writeStream = fs.createWriteStream(saveTo);
      file.pipe(writeStream);
  
      fileUploadPromises.push(new Promise((resolve, reject) => {
        writeStream.on('finish', () => {
          uploadedFiles.push(filename); // Store the filename
          resolve();
        });
        writeStream.on('error', reject);
      }));
    });
  
    busboy.on('finish', async () => {
      console.log('Upload finished');
      console.log('Uploaded files:', uploadedFiles);
  
  
      try {
        // Fetch the existing dossier to get current files
        const existingDossier = await db.dossier.findUnique({
          where: { id: dossierId },
        });
  
        if (!existingDossier) {
          console.error('Dossier not found:', dossierId);
          return NextResponse.json({ error: 'Dossier not found' }, { status: 404 });
        }
  
        // Append new files to existing files
        const updatedFiles = [...existingDossier.files, ...uploadedFiles];
        console.log('Updated files:', updatedFiles);
  
        // Update dossier with new files
        const updatedDossier = await db.dossier.update({
          where: { id: dossierId },
          data: {
            files: updatedFiles, // Append new files to existing ones
          },
        });
  
        console.log('Dossier updated with files:', uploadedFiles);
      } catch (error) {
        console.error('Failed to update dossier with files:', error);
        return NextResponse.json({ error: 'Failed to update dossier with files' }, { status: 500 });
      }
  
      return NextResponse.json({ message: 'File(s) uploaded and dossier updated successfully' }, { status: 200 });
    });
  
    busboy.on('error', (err) => {
      console.error('Upload error:', err);
      throw err;
    });
  
    // Convert the incoming request body into a Node.js stream
    const readableStream = new Readable({
      read() {}
    });
  
    req.body.pipeTo(new WritableStream({
      write(chunk) {
        readableStream.push(Buffer.from(chunk));
      },
      close() {
        readableStream.push(null);
      },
      abort(err) {
        console.error('Stream error:', err);
        readableStream.destroy(err);
      }
    }));
  
    readableStream.pipe(busboy);
  
    // Await all file upload promises to ensure file processing is complete
    await Promise.all(fileUploadPromises);
  
    // Ensure the response is sent after all promises have resolved
    return NextResponse.json({ message: 'File(s) uploaded successfully' }, { status: 200 });
  }



  export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const dossierId = url.searchParams.get('dossierId');

    if (!dossierId) {
        return NextResponse.json({ error: 'Dossier ID is required' }, { status: 400 });
    }

    try {
        // Fetch dossier with patient and files
        const dossier = await db.dossier.findUnique({
            where: { id: dossierId },
            include: {
                patient: true,
            },
        });

        if (!dossier || !dossier.files || dossier.files.length === 0) {
            return NextResponse.json({ error: 'No files found' }, { status: 404 });
        }

        // Create a new ZIP archive
        const archive = archiver('zip', { zlib: { level: 9 } });
        const stream = new PassThrough();
        archive.pipe(stream);

        // Create a folder with patient's name
        const patientFolder = `${dossier.patient.nom}_${dossier.patient.prenom}`.replace(/\s+/g, '_');

        dossier.files.forEach(file => {
            const filePath = path.resolve('public/uploads', file);
            if (fs.existsSync(filePath)) {
                archive.file(filePath, { name: path.join(patientFolder, path.basename(file)) });
            }
        });

        archive.finalize();

        return new NextResponse(stream, {
            headers: {
                'Content-Disposition': `attachment; filename="${patientFolder}.zip"`,
                'Content-Type': 'application/zip',
            },
        });
    } catch (error) {
        console.error('Error downloading files:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}