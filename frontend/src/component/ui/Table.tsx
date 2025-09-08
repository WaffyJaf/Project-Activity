import React from 'react';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  children,
  className,
  ...rest
}) => (
  <table className={`w-full border-collapse ${className ?? ''}`} {...rest}>
    {children}
  </table>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className,
  ...rest
}) => (
  <thead className={className} {...rest}>
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className,
  ...rest
}) => (
  <tbody className={className} {...rest}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  children,
  className,
  ...rest
}) => (
  <tr className={`border-b ${className ?? ''}`} {...rest}>
    {children}
  </tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableHeaderCellElement>> = ({
  children,
  className,
  ...rest
}) => (
  <th className={`text-left p-2 bg-gray-100 ${className ?? ''}`} {...rest}>
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableDataCellElement>> = ({
  children,
  className,
  ...rest
}) => (
  <td className={`p-2 ${className ?? ''}`} {...rest}>
    {children}
  </td>
);
