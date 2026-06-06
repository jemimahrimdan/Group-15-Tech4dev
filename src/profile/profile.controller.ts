import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
    UseInterceptors,
    UploadedFile,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { multerConfig } from './upload/multer.config';
import { memoryStorage } from 'multer';
import { S3Service } from '../common/storage/s3.service';
import { UpdateProfileDto } from './dto';
import { file } from 'multer';


@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService,
                private readonly s3Service: S3Service,
  ) {}

  @Post('create')
  createProfile(@Req() req, @Body() dto: CreateProfileDto) {
    return this.profileService.createProfile(req.user.userId, dto);
  }

  @Post('update')
  updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(req.user.userId, dto);
  }

  @Get('me')
  getMyProfile(@Req() req) {
    return this.profileService.getMyProfile(req.user.userId);
  }

  @Post('avatar')
@UseInterceptors(
  FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        return callback(new Error('Only image files allowed'), false);
      }
      callback(null, true);
    },
  }),
)
async uploadAvatar(
  @UploadedFile() file: any,
  @Req() req,
) {
  const url = await this.s3Service.uploadFile(file, 'avatars');

  return this.profileService.updateAvatar(req.user.userId, url);
}
}