import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn({ name: 'user_id'})
    id: number;

    @Column()
    email: string;

    @Column()
    password: string;
}
