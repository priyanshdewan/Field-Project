import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to Bizora AI Business Operating System API Gateway!';
  }
}
