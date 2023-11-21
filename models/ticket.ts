import { UUID } from "crypto";
import {
  Table,
  Column,
  Model,
  BelongsTo,
  ForeignKey,
  DataType,
} from "sequelize-typescript";
import TicketType from "./ticketType";
import User from "./user";

@Table
export default class Ticket extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: number;

  @Column({
    type: DataType.STRING,
  })
  status!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
  })
  userId!: UUID;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => TicketType)
  @Column
  ticketTypeId!: number;

  @BelongsTo(() => TicketType)
  ticketType!: TicketType;
}
