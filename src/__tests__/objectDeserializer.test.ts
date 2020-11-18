import { DeserializationError, DeserializationPath, deserialize, ObjectDeserializer } from '..';

enum Role {
  USER,
  ADMIN,
}

type User = {
  login: string;
  birthday?: Date;
  role: Role;
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
  };
}

test('Simple usage', () => {
  type Person = {
    name: string;
    birthday?: Date;
  };

  function personMapper(d: ObjectDeserializer): Person {
    return {
      name: d.required('name').asString,
      birthday: d.optional('birthday')?.asDate,
    };
  }

  const response = `
  {
    "person": {
      "name": "John",
      "birthday": "1990-01-01"
    }
  }`;

  const person = deserialize<Person>(JSON.parse(response), d =>
    d.required('person').asObject(d => ({
      name: d.required('name').asString,
      birthday: d.optional('birthday')?.asDate,
    }))
  );

  expect(person).toEqual({
    name: 'John',
    birthday: new Date('1990-01-01'),
  });
});

test('Advanced user deserialization', () => {
  const response = `
  {
    "result": {
      "users": [
        {
          "login": "admin",
          "role": "ADMIN"
        },
        {
          "login": "user",
          "birthday": "1990-01-01",
          "role": "USER"
        }
      ]
    }
  }`;

  const dto = JSON.parse(response);

  const users = deserialize(dto, d => d.required('result.users').asArrayOfObjects(userMapper));

  expect(users).toEqual([
    {
      login: 'admin',
      role: Role.ADMIN,
    },
    {
      login: 'user',
      role: Role.USER,
      birthday: new Date('1990-01-01'),
    },
  ]);
});
