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
import TicketType from "./ticketType.js";
import User from "./user.js";

@Table({
  validate: {
    myCustomValidator(this: Event) {
      if (this.endDate < this.startDate) {
        throw "La fecha de término no puede ser anterior a la de inicio";
      }
    },
  },
})
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
    validate: {
      custVal: (creationDate: Date) => {
        const currentDate = new Date();
        currentDate.setSeconds(currentDate.getSeconds() - 1);
        if (creationDate < currentDate) {
          throw "La fecha del evento no puede ser anterior al momento actual";
        }
      },
    },
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
  public user!: Awaited<User>;

  @HasMany(() => TicketType)
  ticketTypes!: TicketType[];
}
