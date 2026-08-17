import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// This guard checks: "did you send a valid login token (JWT)?"
// If yes, it lets you in and attaches your user info to the request.
// If no, it blocks you with a 401 error before your code even runs.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
