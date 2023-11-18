import { UUID } from "crypto";
import { Table, Column, Model } from "sequelize-typescript";

@Table
export default class User extends Model {
  @Column({ primaryKey: true })
  id: UUID;

  @Column
  auth: string;
}
