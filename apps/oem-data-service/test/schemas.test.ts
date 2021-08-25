import Ajv, { Schema } from 'ajv';
import chargepointOemSchema from '../schemas/chargepoint-schema.json';
import chargepointOemDataExample from '../schemas/chargepoint-data-example.json';

const ajv = new Ajv();

const verifySchema = (schema: Schema, json: unknown): void => {
  const validate = ajv.compile(schema);
  const valid = validate(json);
  expect(valid).toBeTruthy();
};

const expectFailingSchema = (schema: Schema, json: unknown): void => {
  const validate = ajv.compile(schema);
  const valid = validate(json);
  expect(valid).toBeFalsy();
};

describe('OEM data schemas', () => {
  test('correct chargepoint schema should verify', async () => {
    verifySchema(chargepointOemSchema, chargepointOemDataExample);
  });
  test('incorrect chargepoint schema should fail', async () => {
    const json = {
      description: 1
    };
    expectFailingSchema(chargepointOemSchema, json);
  });
});
