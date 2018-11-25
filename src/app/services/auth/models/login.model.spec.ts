import { LoginModel } from './login.model';
import * as faker from 'faker';

/**
 * get Fake Login Model
 *
 * returns fake  @class LoginModel
 */

export function getFakeLoginModel(): LoginModel {
  return {
    userName: faker.internet.userName(),
    password: faker.internet.password()
  };
}
