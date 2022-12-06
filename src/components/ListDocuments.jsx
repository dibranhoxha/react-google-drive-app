import React, { useCallback } from "react";
import moment from "moment";
import { debounce } from "lodash";

import { Col, Drawer, Row, Button, Input, Table, Tooltip } from "antd";
const { Search } = Input;

const columns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Last Modified Date",
    dataIndex: "modifiedTime",
    key: "modifiedTime",
    render: (text) => <span>{moment(text).format("Do MMM YYYY HH:mm A")}</span>,
  },
  {
    title: "Action",
    key: "status",
    dataIndex: "status",
  },
];

const ListDocuments = ({
  visible,
  onClose,
  documents = [],
  onSearch,
  signedInUser,
  onSignOut,
  isLoading,
  setSelectedFiles,
}) => {
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedFiles(selectedRows);
    },
  };

  const search = (value) => {
    delayedQuery(`name contains '${value}'`);
  };

  const delayedQuery = useCallback(
    debounce((q) => onSearch(q), 500),
    []
  );

  console.log(signedInUser);

  return (
    <Drawer
      title="Select Google Drive Document"
      placement="right"
      closable
      onClose={onClose}
      open={visible}
      width={900}
    >
      <Row gutter={16}>
        <Col span={24}>
          <div style={{ marginBottom: 20 }}>
            <p>
              Signed In as: {`${signedInUser?.wt.Ad} (${signedInUser?.wt.cu})`}
            </p>
            <Button type="primary" onClick={onSignOut}>
              Sign Out
            </Button>
          </div>

          <div className="table-card-actions-container">
            <div className="table-search-container">
              <Search
                placeholder="Search Google Drive"
                onChange={(e) => search(e.target.value)}
                onSearch={(value) => search(value)}
                className="table-search-input"
                size="large"
                enterButton
              />
            </div>
          </div>
          <Table
            rowSelection={rowSelection}
            className="table-striped-rows"
            columns={columns}
            dataSource={documents}
            pagination={{ simple: true }}
            loading={isLoading}
            rowKey={(record) => record.id}
          />
        </Col>
      </Row>
    </Drawer>
  );
};

export default ListDocuments;
