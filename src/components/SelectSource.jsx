import React, { useState } from "react";
import { Row, Col, Spin, Image, Button, Space } from "antd";
import styled from "styled-components";
import { gapi } from "gapi-script";
import GoogleDriveImage from "../assets/google-drive.png";
import ListDocuments from "./ListDocuments";
import { style } from "../../styles";
import jsPDF from "jspdf";
import { encode, decode } from "js-base64";

const NewDocumentWrapper = styled.div`
  ${style}
`;

// Client ID and API key from the Developer Console
const CLIENT_ID = import.meta.env.VITE_APP_GOOGLE_DRIVE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_APP_GOOGLE_DRIVE_API_KEY;

console.log(CLIENT_ID);
// Array of API discovery doc URLs for APIs
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/drive";

const SelectSource = () => {
  const [listDocumentsVisible, setListDocumentsVisibility] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [isLoadingGoogleDriveApi, setIsLoadingGoogleDriveApi] = useState(false);
  const [isFetchingGoogleDriveFiles, setIsFetchingGoogleDriveFiles] =
    useState(false);
  const [signedInUser, setSignedInUser] = useState();
  const [selectedFiles, setSelectedFiles] = useState([]);

  /**
   * Print files.
   */
  const listFiles = (searchTerm = null) => {
    setIsFetchingGoogleDriveFiles(true);
    gapi.client.drive.files
      .list({
        pageSize: 10,
        fields: "nextPageToken, files(id, name, mimeType, modifiedTime)",
        q: searchTerm,
      })
      .then(function (response) {
        setIsFetchingGoogleDriveFiles(false);
        setListDocumentsVisibility(true);
        const res = JSON.parse(response.body);
        setDocuments(res.files);
      });
  };

  /**
   *  Sign in the user upon button click.
   */
  const handleAuthClick = (event) => {
    gapi.auth2.getAuthInstance().signIn();
  };

  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  const updateSigninStatus = (isSignedIn) => {
    if (isSignedIn) {
      // Set the signed in user
      setSignedInUser(gapi.auth2.getAuthInstance().currentUser.le);
      setIsLoadingGoogleDriveApi(false);
      // list files if user is authenticated
      listFiles();
    } else {
      // prompt user to sign in
      handleAuthClick();
    }
  };

  /**
   *  Sign out the user upon button click.
   */
  const handleSignOutClick = (event) => {
    setListDocumentsVisibility(false);
    gapi.auth2.getAuthInstance().signOut();
  };

  /**
   *  Initializes the API client library and sets up sign-in state
   *  listeners.
   */
  const initClient = () => {
    setIsLoadingGoogleDriveApi(true);
    gapi.client
      .init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
      })
      .then(
        function () {
          // Listen for sign-in state changes.
          gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

          // Handle the initial sign-in state.
          updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        },
        function (error) {}
      );
  };

  const handleClientLoad = () => {
    gapi.load("client:auth2", initClient);
  };

  const showDocuments = () => {
    setListDocumentsVisibility(true);
  };

  const onClose = () => {
    setListDocumentsVisibility(false);
  };

  function blobToBase64(blob) {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  const handleExportPdf = async () => {
    // const pdf = new jsPDF("p", "mm", "a4");
    let x = 0;
    let y = 0;
    selectedFiles.map((file) =>
      gapi.client.drive.files
        .get({ fileId: file.id, alt: "media" })
        .then((res) => {
          const bytes = res.body;
          // const objectUrl = URL.createObjectURL(
          //   new Blob(
          //     [new Uint8Array(bytes.length).map((_, i) => bytes.charCodeAt(i))],
          //     { type: "image/jpeg" }
          //   )
          // );
          const blob = new Blob(
            [new Uint8Array(bytes.length).map((_, i) => bytes.charCodeAt(i))],
            { type: "image/jpeg" }
          );
          blobToBase64(blob).then((base64) => {
            console.log(decode(base64));
            // pdf.addImage(base64, "JPEG", x, y, 180, 160);
            // y += 50;
          });
        })
    );
    // pdf.save("file.pdf");
  };

  return (
    <>
      <NewDocumentWrapper>
        <Row gutter={16} className="custom-row">
          <ListDocuments
            visible={listDocumentsVisible}
            onClose={onClose}
            documents={documents}
            onSearch={listFiles}
            signedInUser={signedInUser}
            onSignOut={handleSignOutClick}
            isLoading={isFetchingGoogleDriveFiles}
            setSelectedFiles={setSelectedFiles}
          />
          <Col span={8}>
            <Spin spinning={isLoadingGoogleDriveApi} style={{ width: "100%" }}>
              <div
                onClick={() => handleClientLoad()}
                className="source-container"
              >
                <div className="icon-container">
                  <div className="icon icon-success">
                    <img height="80" width="80" src={GoogleDriveImage} />
                  </div>
                </div>
                <div className="content-container">
                  <p className="title">Google Drive</p>
                  <span className="content">
                    Import documents straight from your google drive
                  </span>
                </div>
              </div>
            </Spin>
          </Col>
        </Row>
      </NewDocumentWrapper>
      <Space direction="vertical">
        <Button onClick={handleExportPdf}>Export (PDF)</Button>
        {selectedFiles.map((file) => (
          <Image
            src={`https://drive.google.com/uc?export=view&id=${file.id}`}
          />
        ))}
      </Space>
    </>
  );
};

export default SelectSource;
