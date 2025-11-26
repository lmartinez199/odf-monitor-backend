import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ConfigModule, ConfigService } from "./config";
import { OdfMonitorModule } from "./odf-monitor/odf-monitor.module";

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get("MONGODB_URI"),
        retryAttempts: 3,
        retryDelay: 1000,
      }),
    }),
    OdfMonitorModule,
  ],
})
export class AppModule {}
