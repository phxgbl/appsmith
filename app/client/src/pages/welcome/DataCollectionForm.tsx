import Button, { Category, Size } from "components/ads/Button";
import Toggle from "components/ads/Toggle";
import { ControlWrapper } from "components/propertyControls/StyledControls";
import React from "react";
import styled from "styled-components";
import {
  FormBodyWrapper,
  FormHeaderIndex,
  FormHeaderLabel,
  FormHeaderSubtext,
  FormHeaderWrapper,
} from "./common";

const DataCollectionFormWrapper = styled.div`
  width: 100%;
`;

export default class DataCollectionForm extends React.PureComponent<
  any,
  {
    allowDataCollection: boolean;
  }
> {
  ref = React.createRef<HTMLDivElement>();

  constructor(props: any) {
    super(props);

    this.state = {
      allowDataCollection: false,
    };
  }

  scrollIntoView() {
    this.ref.current?.scrollIntoView();
  }

  render() {
    return (
      <DataCollectionFormWrapper ref={this.ref}>
        <FormHeaderWrapper>
          <FormHeaderIndex>2/3</FormHeaderIndex>
          <FormHeaderLabel>Usage data preference</FormHeaderLabel>
          <FormHeaderSubtext>
            Data is collected anonymously to improve your experience. <br />
            <a href="">List of tracked items</a>
          </FormHeaderSubtext>
        </FormHeaderWrapper>
        <FormBodyWrapper>
          <ControlWrapper>
            <Toggle
              onToggle={() => 1 + 1}
              value={this.state.allowDataCollection}
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
      </DataCollectionFormWrapper>
    );
  }
}
