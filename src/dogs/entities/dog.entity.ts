import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('dogs')
export class Dog {
  @PrimaryGeneratedColumn({ name: 'dog_id' })
  id: number;

  @Column()
  breed: string;

  @Column({ name: 'subbreed' })
  subBreed: string;

  @Column({ name: 'imageurl' })
  imageUrl: string;

  @Column()
  custom: boolean;

  @Column()
  timestamp: string;
}
