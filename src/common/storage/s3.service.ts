import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { file } from 'multer';

@Injectable()
export class S3Service {
  private s3: S3Client;

  constructor(private config: ConfigService) {
    this.s3 = new S3Client({
      region: this.config.get<string>('AWS_REGION')!,
      credentials: {
        accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.config.get<string>('AWS_SECRET_ACCESS_KEY')!,
      },
    });
  }

  async uploadFile(
    file: any, folder = 'avatars') {
    if (!file || !file.buffer) {
      throw new Error('Invalid file upload');
    }

    const safeName = file.originalname.replace(/\s/g, '-');
    const key = `${folder}/${uuid()}-${safeName}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.config.get<string>('AWS_BUCKET_NAME')!,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const bucket = this.config.get<string>('AWS_BUCKET_NAME')!;
    const region = this.config.get<string>('AWS_REGION')!;

    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  }
}