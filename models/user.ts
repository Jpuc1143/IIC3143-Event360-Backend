import { UUID } from "crypto";
import { Table, Column, Model, Default, DataType } from "sequelize-typescript";

@Table
export default class User extends Model {
  @Default(DataType.UUIDV4)
  @Column({ primaryKey: true })
  id: UUID;

  @Column
  auth: string;
}