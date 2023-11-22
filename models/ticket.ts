import { UUID } from "crypto";
import {
  Table,
  Column,
  Model,
  BelongsTo,
  ForeignKey,
  Default,
  DataType,
} from "sequelize-typescript";
import TicketType from "./ticketType";
import User from "./user";

@Table
export default class Ticket extends Model {
  @Default(DataType.UUIDV4)
  @Column({ primaryKey: true })
  id!: UUID;

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
  ticketTypeId!: UUID;

  @BelongsTo(() => TicketType)
  ticketType!: TicketType;
}