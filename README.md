# Typesafe Object Deserializer

This is a simple and lightweight library for typesafe deserialize, convert and validate **POJO** (Plain Old Javascript Object) which is usually came from the server as a JSON response.

If any error occured object deserializer throws the `DeserializationError` with an additional information about path to the invalid value in a POJO.

This is a simple usage example:
```typescript
import * from 'object-deserializer';

type Person = {
  name: string;
  birthday?: Date;
};

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
```

You can create your own value mappers like this:
```typescript
function personMapper(d: ObjectDeserializer): Person {
  return {
    name: d.required('name').asString,
    birthday: d.optional('birthday')?.asDate,
  };
}
```
And use it later:
```typescript
const person = d.required('person').asObject(personMapper);
```

The more advanced examples you can find in a unit tests [here](src/__tests__/objectDeserializer.test.ts).