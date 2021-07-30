import React from "react";
import styled from "styled-components";
import {
  FormBodyWrapper,
  FormHeaderIndex,
  FormHeaderLabel,
  FormHeaderWrapper,
  Label,
  ControlWrapper,
} from "./common";
import TextInput from "components/ads/TextInput";
import Button, { Category, Size } from "components/ads/Button";
import Dropdown from "components/ads/Dropdown";

const DetailsFormWrapper = styled.div`
  width: 100%;
`;

export default class DetailsForm extends React.PureComponent<
  any,
  { [key: string]: string }
> {
  ref = React.createRef<HTMLDivElement>();

  constructor(props: any) {
    super(props);
    this.state = DetailsFormConfigs.reduce(
      (obj, curr) => Object.assign(obj, { [curr.name]: "" }),
      {},
    );
  }

  scrollIntoView() {
    this.ref.current?.scrollIntoView();
  }

  render() {
    return (
      <DetailsFormWrapper ref={this.ref}>
        <FormHeaderWrapper>
          <FormHeaderIndex>1/3</FormHeaderIndex>
          <FormHeaderLabel>What should we call you?</FormHeaderLabel>
        </FormHeaderWrapper>
        <FormBodyWrapper>
          {DetailsFormConfigs.map((config: DetailsFormConfigType) => {
            return (
              <ControlWrapper key={config.name}>
                <Label>{config.label}</Label>
                {config.controlType == "DROP_DOWN" ? (
                  <Dropdown
                    onSelect={() => 1 + 1}
                    options={roleOptions}
                    selected={{ label: "", value: "" }}
                  />
                ) : (
                  <TextInput defaultValue={this.state[config.name]} />
                )}
              </ControlWrapper>
            );
          })}
          <Button
            category={Category.primary}
            fill={false}
            onClick={(el) => this.props.onNext()}
            size={Size.medium}
            tag="button"
            text="Next"
          />
        </FormBodyWrapper>
      </DetailsFormWrapper>
    );
  }
}

type options = {
  label: string;
  value: string;
};

type DetailsFormConfigType = {
  label: string;
  name: string;
  controlType: string;
};

const DetailsFormConfigs: DetailsFormConfigType[] = [
  {
    label: "Full Name",
    name: "full_name",
    controlType: "INPUT_TEXT",
  },
  {
    label: "Create Password",
    name: "create_password",
    controlType: "INPUT_PASSWORD",
  },
  {
    label: "Verify Password",
    name: "verify_password",
    controlType: "INPUT_PASSWORD",
  },
  {
    label: "What role do you play?",
    name: "role",
    controlType: "DROP_DOWN",
  },
  {
    label: "Company name (optional)",
    name: "company_name",
    controlType: "INPUT_TEXT",
  },
];

const roleOptions = [
  {
    label: "admin",
    value: "admin",
  },
  {
    label: "admin",
    value: "admin",
  },
];
