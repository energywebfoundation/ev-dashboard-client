import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import * as vexter from './data/vehicles/vexterxs.json';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get(':assetId')
  get(@Param('assetId') assetId: string): object {
    console.log(vexter);
    return { data: [vexter] };
  }
}
