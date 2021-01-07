import { ApiProperty } from '@nestjs/swagger';

export class FileUpload {
  @ApiProperty({
      type: 'string',
      format: 'binary'
  })
  file?: any;
}