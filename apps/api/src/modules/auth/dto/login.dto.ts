import { IsString, MaxLength } from 'class-validator';

export class Login {
  @IsString() @MaxLength(80) login!: string;
  @IsString() @MaxLength(100) password!: string;
}
