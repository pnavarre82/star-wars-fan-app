import { LoginModel } from './login.model';
import * as faker from 'faker';

export function getFakeLoginModel(): LoginModel {
  return {
    userName: faker.internet.userName(),
    password: faker.internet.password()
  };
}
