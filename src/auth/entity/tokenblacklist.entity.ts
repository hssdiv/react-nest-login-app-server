import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('tokenblacklist')
export class TokenBlacklist {
  @PrimaryColumn()
  token: string;

  @Column()
  expires: number;
}
