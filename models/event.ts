import { UUID } from "crypto";
import {
  Table,
  Column,
  Model,
  HasMany,
  BelongsTo,
  ForeignKey,
  Default,
  DataType,
} from "sequelize-typescript";
import TicketType from "./ticketType";
import User from "./user";

@Table
export default class Event extends Model {
  @Default(DataType.UUIDV4)
  @Column({ primaryKey: true })
  id: UUID;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  organization!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  description!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  eventType!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  startDate!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  endDate!: Date;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  location!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  image!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  merchantCode!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
  })
  userId!: UUID;

  @BelongsTo(() => User)
  user!: User;

  @HasMany(() => TicketType)
  ticketTypes!: TicketType[];
}
