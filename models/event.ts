import { UUID } from "crypto";
import {
  Table,
  Column,
  Model,
  HasMany,
  Default,
  DataType,
} from "sequelize-typescript";
import TicketType from "./ticketType";

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
  description!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  startDate!: Date;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  merchantCode!: string;

  @HasMany(() => TicketType)
  ticketTypes!: TicketType[];
}
