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
import TicketType from "./ticketType.js";
import User from "./user.js";

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

  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  secret: UUID;

  @BelongsTo(() => User)
  public user!: Awaited<User>;

  @ForeignKey(() => TicketType)
  @Column
  ticketTypeId!: UUID;

  @BelongsTo(() => TicketType)
  ticketType!: TicketType;
}
