import { customType, text, timestamp } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const tsvector = customType<{ data: string; notNull: false }>({
  dataType() {
    return 'tsvector';
  },
});

export const cuid = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => createId());

export const ts = (name: string) =>
  timestamp(name, { precision: 3, mode: 'date', withTimezone: false });
