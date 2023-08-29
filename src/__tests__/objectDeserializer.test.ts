import { DeserializationError, DeserializationPath, deserialize, ObjectDeserializer } from '..';

enum Role {
  USER,
  ADMIN,
}

enum Status {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
}

type User = {
  login: string;
  birthday?: Date;
  role: Role;
  status: Status;
};

function roleMapper(v: any, path: DeserializationPath): Role {
  if (typeof v !== 'string') throw new DeserializationError(path, 'Role value not a string');
  switch (v as string) {
    case 'USER':
      return Role.USER;
    case 'ADMIN':
      return Role.ADMIN;
    default:
      throw new DeserializationError(path, `Unknown role value: ${v}`);
  }
}

function userMapper(d: ObjectDeserializer): User {
  return {
    login: d.required('login').asString,
    role: d.required('role').as(roleMapper),
    birthday: d.optional('birthday')?.asDate,
    status: d.required('status').asEnumValue(Status),
  };
}

describe('Deserialize objects', () => {
  it('Object with user', () => {
    const response = {
      user: {
        login: 'admin',
        role: 'ADMIN',
        status: 'active',
      },
    };
    const user = deserialize<User>(response, (d) => d.required('user').asObject(userMapper));
    expect(user).toEqual({
      login: 'admin',
      role: Role.ADMIN,
      status: 'active',
    });
  });

  it('Array of users', () => {
    const response = {
      result: {
        users: [
          {
            login: 'admin',
            role: 'ADMIN',
            status: 'active',
          },
          {
            login: 'user',
            birthday: '1990-01-01',
            role: 'USER',
            status: 'blocked',
          },
        ],
      },
    };

    const users = deserialize(response, (d) => d.required('result.users').asArrayOfObjects(userMapper));

    expect(users).toEqual([
      {
        birthday: undefined,
        login: 'admin',
        role: Role.ADMIN,
        status: Status.ACTIVE,
      },
      {
        login: 'user',
        role: Role.USER,
        birthday: new Date('1990-01-01'),
        status: Status.BLOCKED,
      },
    ]);
  });
});

describe('Deserialize array', () => {
  it('All items required', () => {
    const response = {
      items: ['a', 'b', 'c'],
    };
    const obj = deserialize(response, (d) => ({
      items: d.required('items').asArrayOfVals((v) => v.asString),
    }));
    expect(obj).toEqual(response);
  });

  it('Throws if required value is undefined', () => {
    const response = {
      items: ['a', undefined, 'c'],
    };
    expect(() =>
      deserialize(response, (d) => ({
        items: d.required('items').asArrayOfVals((v) => v.asString),
      }))
    ).toThrowError(/Value required/);
  });

  it('Items is optional', () => {
    const response = {
      items: ['a', undefined, 'c'],
    };
    const obj = deserialize(response, (d) => ({
      items: d.required('items').asArrayOfOptionalVals((v) => v.asString),
    }));
    expect(obj).toEqual(response);
  });
});
