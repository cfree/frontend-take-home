import { faker } from "@faker-js/faker";
import type { Role } from "~/api/roles";
import type { User } from "~/api/users";

// Faker-backed test data builders. Each accepts overrides so a test can pin the
// fields it asserts on (names, role ids, join dates) while the rest stay
// realistic-but-irrelevant.
export function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: faker.string.uuid(),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    first: faker.person.firstName(),
    last: faker.person.lastName(),
    roleId: faker.string.uuid(),
    photo: faker.image.avatar(),
    ...overrides,
  };
}

export function buildRole(overrides: Partial<Role> = {}): Role {
  return {
    id: faker.string.uuid(),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    name: faker.person.jobTitle(),
    description: faker.lorem.sentence(),
    isDefault: false,
    ...overrides,
  };
}

// Wrap a list of items in the server's paged envelope (a single full page).
export function pageOf<T>(data: T[]) {
  return { data, next: null, prev: null, pages: 1 };
}
