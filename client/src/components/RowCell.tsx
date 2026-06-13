import { Flex, Table } from "@radix-ui/themes";
import type { Responsive } from "@radix-ui/themes/props";
import { type FC, type ReactNode } from "react";

interface RowCellProps {
  justify?: Responsive<"start" | "center" | "end"> | undefined;
  children: ReactNode;
}

export const RowCell: FC<RowCellProps> = ({ justify = "start", children }) => {
  return (
    <Table.Cell justify={justify}>
      <Flex align="center" height="100%">
        {children}
      </Flex>
    </Table.Cell>
  );
};

export default RowCell;
