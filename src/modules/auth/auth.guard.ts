import { ENV } from "@/config/env";
import { PrismaService } from "@/modules/prisma/prisma.service";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { decode, getToken, JWT } from "next-auth/jwt";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const next = context.switchToHttp().getNext();
    try {
      let payload: JWT | null = null;
      // Get the token from the request object
      payload = await getToken({ req, secret: ENV.AUTH_SECRET });
      const headerToken = req.headers.authorization?.split(" ")[1];
      // Check if the token is present in the request headers
      if (!payload && headerToken) {
        payload = await decode({ token: headerToken, secret: ENV.AUTH_SECRET });
      }
      if (!payload) {
        throw new UnauthorizedException("Authentication token is missing or invalid.");
      }
      // Check if the email is present in the payload
      if (!payload.username) {
        throw new UnauthorizedException("Email not found in the authentication token.");
      }
      // Find the user by email in the database
      const user = await this.prisma.admin.findUnique({ where: { username: payload.username } });
      if (!user) {
        throw new UnauthorizedException(
          "User associated with the authentication token email not found."
        );
      }
      req.user = user; // Attach user to the request object

      return true;
    } catch (error) {
      const nextAuthCookieName =
        ENV.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token";
      res.cookie(nextAuthCookieName, "", {
        maxAge: -1,
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: "lax",
      });

      Logger.error(error);
      next(error);
      return false;
    }
  }
}
