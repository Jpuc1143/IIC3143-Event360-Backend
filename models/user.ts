import { UUID } from "crypto";
import {
  Table,
  Column,
  Model,
  HasMany,
  Default,
  DataType,
} from "sequelize-typescript";
import Ticket from "./ticket";
import Event from "./event";

@Table
export default class User extends Model {
  @Default(DataType.UUIDV4)
  @Column({ primaryKey: true })
  id: UUID;

  @Column
  auth: string;

  @HasMany(() => Event)
  events!: Event[];

  @HasMany(() => Ticket)
  tickets!: Ticket[];
}
