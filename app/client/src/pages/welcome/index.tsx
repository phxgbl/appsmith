import React, { useState } from "react";
import styled from "styled-components";
import LandingPage from "./Landing";
import SetupForm from "./SetupForm";

const WelcomeWrapper = styled.div``;

export default function Welcome(props: any) {
  const [showLandingPage, setShowLandingPage] = useState(false);
  return (
    <WelcomeWrapper>
      {showLandingPage ? (
        <LandingPage onGetStarted={() => setShowLandingPage(true)} />
      ) : (
        <SetupForm />
      )}
    </WelcomeWrapper>
  );
}
