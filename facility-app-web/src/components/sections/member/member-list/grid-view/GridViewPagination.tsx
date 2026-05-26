import { ChangeEvent, MouseEvent } from 'react';
import TablePagination from '@mui/material/TablePagination';
import CustomTablePaginationAction from 'components/pagination/CustomTablePaginationAction';

interface GridViewPaginationProps {
  items: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  onShowAllClick?: () => void;
}

const GridViewPagination = ({
  items,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onShowAllClick = () => {},
}: GridViewPaginationProps) => {
  const handleChangePage = (_: MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
    onPageChange(0);
  };

  return (
    <TablePagination
      component="div"
      count={items}
      page={page}
      showFirstButton
      showLastButton
      onPageChange={handleChangePage}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      ActionsComponent={(props) => (
        <CustomTablePaginationAction
          showAllHref="#!"
          onShowAllClick={onShowAllClick}
          showFullPagination
          {...props}
        />
      )}
      sx={{ bgcolor: 'background.paper' }}
    />
  );
};

export default GridViewPagination;
