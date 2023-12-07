import { UUID } from "crypto";
import {
  Table,
  Column,
  Model,
  HasMany,
  Default,
  DataType,
  BeforeCreate,
} from "sequelize-typescript";
import Ticket from "./ticket";
import Event from "./event";
import { ManagementClient } from "auth0";
import "dotenv/config";

const auth0Management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_SECRET,
});

@Table
export default class User extends Model {
  @Default(DataType.UUIDV4)
  @Column({ primaryKey: true })
  id: UUID;

  @Column
  auth: string;

  @Column({
    validate: {
      custVal: (value: string) => {
        if (!/\b[A-Za-z0-9._%+-]+@uc\.cl\b/.test(value)) {
          throw "Email no válido";
        }
      },
    },
  })
  email: string;

  @Column
  name: string;

  @Column
  picture: string;

  @HasMany(() => Event)
  events!: Event[];

  @HasMany(() => Ticket)
  tickets!: Ticket[];

  @BeforeCreate
  static fetchAuth0Data(user: User) {
    user.refreshAuth0Data();
  }

  async refreshAuth0Data() {
    try {
      const data = (await auth0Management.users.get({ id: this.auth })).data;
      this.setDataValue("email", data.email);
      this.setDataValue("name", data.name);
      this.setDataValue("picture", data.picture);
      this.save();
    } catch (error) {
      return;
    }
  }

  async isVerified() {
    try {
      const data = (await auth0Management.users.get({ id: this.auth })).data;
      return data.email_verified;
    } catch {
      return false;
    }
  }
}
