import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ControllerModule } from './modules/controller.module';
import { MyAuthGuard } from './guards/auth.guard';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ResponseInterceptor } from './utils/ResponseInterceptor';
import { GlobalValidation } from './utils/GlobalValidation';
import { ExceptionsFilter } from './utils/ExceptionsFilter';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '10m' },
    }),
    ControllerModule
  ],
  controllers: [AppController],
  providers: [AppService,
    {provide: APP_GUARD,  useClass: MyAuthGuard},

    //global response format status, message ,data
    {provide: APP_INTERCEPTOR, useClass: ResponseInterceptor},

    //global body validation 
    {provide: APP_PIPE, useClass: GlobalValidation},

    //Error Handler
    {provide: APP_FILTER, useClass: ExceptionsFilter}
    
  ],
})
export class AppModule {}
