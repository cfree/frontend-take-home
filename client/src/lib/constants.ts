// dayjs format token for dates shown in the UI, e.g. "Aug 27, 2024".
export const DATE_FORMAT = "MMM D, YYYY";

export const USERS_TABLE_COLUMN_WIDTHS = {
  user: "36%",
  role: "33%",
  joined: "23%",
  actions: undefined,
} as const;

export const ROLES_TABLE_COLUMN_WIDTHS = {
  name: undefined,
  default: "120px",
  actions: "56px",
} as const;
