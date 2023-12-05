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
import Ticket from "./ticket";
import Event from "./event";
import { Op } from "sequelize";

@Table
export default class TicketType extends Model {
  @Default(DataType.UUIDV4)
  @Column({ primaryKey: true })
  id!: UUID;

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

  @ForeignKey(() => Event)
  @Column
  eventId!: UUID;

  @BelongsTo(() => Event)
  event!: Event;

  @HasMany(() => Ticket)
  tickets!: Ticket[];

  async getTicketsLeft(): Promise<number> {
    const ticketsBought = await Ticket.findAndCountAll({
      where: {
        ticketTypeId: this.id,
        status: { [Op.or]: ["approved", "pending"] },
      },
    });
    return this.amount - ticketsBought.count;
  }
}
