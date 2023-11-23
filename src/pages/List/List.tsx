import React, { useState } from 'react';

import { Button, Flex, Space, Upload, message, Table } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import useResize from '../../hooks/useResize';

const List = () => {
  const resize = useResize();
  const [tableData, setTableData] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);

  const dummyRequest = ({ _, onSuccess }: any) => {
    setTimeout(() => {
      onSuccess('ok');
    }, 0);
  };

  const sorterTable = (a: any, b: any): number =>
    typeof a === 'number' && typeof b === 'number'
      ? a - b
      : typeof a === 'string' && typeof b === 'string'
        ? a.localeCompare(b)
        : a instanceof Date && b instanceof Date
          ? a.getTime() - b.getTime()
          : 0;

  const filterTable = (val: any, cel: any) =>
    typeof cel === 'string'
      ? cel.toLowerCase().includes(val.toLowerCase())
      : typeof cel === 'number'
        ? cel === Number(val)
        : cel instanceof Date
          ? cel.getTime() === new Date(val).getTime()
          : true;

  const fileChange = (info: any) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const newColumns = Object.keys(jsonData[0] || {}).map((key) => ({
          title: key,
          dataIndex: key,
          key,
          sorter: (a: any, b: any) => sorterTable(a[key], b[key]),
          defaultSortOrder: 'ascend',
          filters: Array.from(new Set(jsonData.map((item: any) => item[key]))).map((filterValue: any) => ({
            text: filterValue,
            value: filterValue,
          })),
          onFilter: (value: any, record: any) => filterTable(value, record[key]),
        }));

        setColumns(newColumns);
        setTableData(jsonData);
      };

      reader.readAsBinaryString(info.file.originFileObj);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  return (
    <Space>
      <Flex gap="middle" align="start" vertical>
        {tableData?.length > 0 ? (
          <Table
            scroll={{
              x: resize[0] * (resize[0] > 1000 ? 2 : resize[0] > 700 ? 3 : resize[0] > 500 ? 4 : 4.8),
              y: 600,
            }}
            style={{ maxWidth: resize[0] * 0.92 }}
            dataSource={tableData}
            columns={columns}
          />
        ) : (
          <Upload customRequest={dummyRequest} onChange={fileChange} accept=".xlsx, .xls" showUploadList={false}>
            <Button type="primary" icon={<UploadOutlined />}>
              Upload File .xlsx or .xls
            </Button>
          </Upload>
        )}
      </Flex>
    </Space>
  );
};

export default List;
