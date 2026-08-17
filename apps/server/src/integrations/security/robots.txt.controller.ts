import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { SkipTransform } from '../../common/decorators/skip-transform.decorator';

@Controller('robots.txt')
export class RobotsTxtController {
  @SkipTransform()
  @HttpCode(HttpStatus.OK)
  @Get()
  async robotsTxt() {
    // Instance privee : rien ne doit etre explore ni indexe.
    return 'User-Agent: *\nDisallow: /';
  }
}
