import { UUID } from "crypto";
import { Table, Column, Model, Default, DataType } from "sequelize-typescript";

@Table
export default class User extends Model {
  @Column({ primaryKey: true })
  @Default(DataType.UUIDV4)
  id: UUID;

  @Column
  auth: string;
}