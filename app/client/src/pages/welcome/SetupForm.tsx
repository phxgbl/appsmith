import React, { useContext, useState } from "react";
import styled, { ThemeContext } from "styled-components";
import DataCollectionForm from "./DataCollectionForm";
import DetailsForm from "./DetailsForm";
import NewsletterForm from "./NewsletterForm";

const PageWrapper = styled.div`
  width: 100%;
  background-color: #f0f0f0;
  display: flex;
`;

const SetupFormContainer = styled.div`
  width: ${(prop) => prop.theme.pageContentWidth / 2}px;
  height: 100vh;
  overflow: auto;
  padding-left: ${(props) => props.theme.spaces[17]}px;
`;

const DoodleContainer = styled.div`
  width: ${(prop) => prop.theme.pageContentWidth / 2}px;
  height: 100vh;
`;

const LeftContainer = styled.div`
  width: 50%;
  display: flex;
  justify-content: flex-end;
  background-color: #fff;
`;

const RightContainer = styled.div`
  width: 50%;
  display: flex;
  justify-content: flex-start;
`;

export default function SetupForm(props: any) {
  const detailFormRef = React.createRef<DetailsForm>();
  const dataCollectionFormRef = React.createRef<DataCollectionForm>();
  const newsletterFormRef = React.createRef<NewsletterForm>();

  return (
    <PageWrapper>
      <LeftContainer>
        <SetupFormContainer>
          <DetailsForm
            onNext={dataCollectionFormRef.current?.scrollIntoView()}
            ref={detailFormRef}
          />
          <DataCollectionForm
            onNext={newsletterFormRef.current?.scrollIntoView()}
            ref={dataCollectionFormRef}
          />
          <NewsletterForm ref={newsletterFormRef} />
        </SetupFormContainer>
      </LeftContainer>
      <RightContainer>
        <DoodleContainer>test</DoodleContainer>
      </RightContainer>
    </PageWrapper>
  );
}
