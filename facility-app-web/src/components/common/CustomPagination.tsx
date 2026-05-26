import { ChangeEvent, MouseEvent, useState } from 'react';
import TablePagination, { TablePaginationProps } from '@mui/material/TablePagination';
import CustomTablePaginationAction from 'components/pagination/CustomTablePaginationAction';

export type CustomPaginationProps = Omit<
  TablePaginationProps,
  'count' | 'page' | 'onPageChange' | 'rowsPerPage'
> & {
  count: number;
};

const CustomPagination = ({ count, sx, ...rest }: CustomPaginationProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(3);

  const handleChangePage = (_: MouseEvent<HTMLButtonElement> | null, newPage: number) =>
    setPage(newPage);
  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <TablePagination
      component="div"
      count={count}
      page={page}
      showFirstButton
      showLastButton
      onPageChange={handleChangePage}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      ActionsComponent={(props) => (
        <CustomTablePaginationAction
          showAllHref="#!"
          onShowAllClick={() => {}}
          showFullPagination
          {...props}
        />
      )}
      sx={{ bgcolor: 'background.paper', ...sx }}
      {...rest}
    />
  );
};

export default CustomPagination;
