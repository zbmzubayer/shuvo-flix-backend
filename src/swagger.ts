import { type Server } from "http";

import { Logger } from "@nestjs/common";
import { type NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function generateSwagger(app: NestExpressApplication<Server>) {
  const logger = new Logger("Swagger");

  logger.log(`Generating Swagger documentation...\n`);

  const config = new DocumentBuilder()
    .setTitle("Shuvo Flix API")
    .setDescription("API documentation for Shuvo Flix")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const swaggerURL = "docs";

  SwaggerModule.setup(swaggerURL, app, document);

  logger.log(`Swagger documentation available in the "/${swaggerURL}" endpoint\n`);
}
