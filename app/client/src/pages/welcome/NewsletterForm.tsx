import Button, { Category, Size } from "components/ads/Button";
import TextInput from "components/ads/TextInput";
import { ControlWrapper } from "components/propertyControls/StyledControls";
import React from "react";
import styled from "styled-components";
import {
  FormBodyWrapper,
  FormHeaderIndex,
  FormHeaderLabel,
  FormHeaderSubtext,
  FormHeaderWrapper,
  Label,
} from "./common";

const NewsletterContainer = styled.div`
  widht: 100%;
`;

const StyledButton = styled(Button)`
  margin-top: ${(props) => props.theme.spaces[5]}px;
`;

export default class NewsletterForm extends React.PureComponent<
  any,
  {
    email: string;
  }
> {
  ref = React.createRef<HTMLDivElement>();

  constructor(props: any) {
    super(props);
    this.state = {
      email: "",
    };
  }

  scrollIntoView() {
    this.ref.current?.scrollIntoView();
  }

  render() {
    return (
      <NewsletterContainer ref={this.ref}>
        <FormHeaderWrapper>
          <FormHeaderIndex>1/3</FormHeaderIndex>
          <FormHeaderLabel>Stay in touch</FormHeaderLabel>
          <FormHeaderSubtext>
            Get frequent updates about Appsmith. We do not spam you.
          </FormHeaderSubtext>
        </FormHeaderWrapper>
        <FormBodyWrapper>
          <ControlWrapper>
            <Label>Email Id</Label>
            <TextInput defaultValue={this.state.email} />
            <StyledButton
              category={Category.tertiary}
              onClick={() => this.props.onNext()}
              size={Size.medium}
              tag="button"
              text="Subscribe"
            />
          </ControlWrapper>
          <Button
            category={Category.primary}
            fill={false}
            onClick={() => this.props.onNext()}
            size={Size.medium}
            tag="button"
            text="Next"
          />
        </FormBodyWrapper>
      </NewsletterContainer>
    );
  }
}
