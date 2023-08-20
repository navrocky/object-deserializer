# Typesafe Object Deserializer

<a href="https://www.npmjs.com/package/object-deserializer" target="_blank">
  <img src="https://github.com/navrocky/object-deserializer/workflows/Publish%20to%20npmjs.com/badge.svg" alt="badge" /img>
</a>

This is a simple and lightweight library for typesafe deserialization, convertion and validation of a **POJO** (Plain Old Javascript Object) which you usually receive from the server as a JSON response.

If any error occures object deserializer throws a `DeserializationError` with an additional information about a path to the invalid value in a POJO.

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

You can find more advanced examples in the unit tests [file](src/__tests__/objectDeserializer.test.ts).
