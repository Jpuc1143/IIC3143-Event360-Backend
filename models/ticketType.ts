import { Table, Column, Model, HasMany, DataType } from "sequelize-typescript";
import Ticket from "./ticket";

@Table
export default class TicketType extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: number;

  @Column({
    type: DataType.INTEGER,
  })
  price!: number;

  @Column({
    type: DataType.INTEGER,
  })
  amount!: number;

  @Column({
    type: DataType.STRING,
  })
  domainWhitelist: string;

  @HasMany(() => Ticket)
  tickets!: Ticket[];
}
