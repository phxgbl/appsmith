import React from "react";
import BaseWidget, { WidgetProps, WidgetState } from "./BaseWidget";
import { WidgetType, RenderModes } from "constants/WidgetConstants";
import InputComponent, {
  InputComponentProps,
  getCurrencyOptions,
} from "components/designSystems/blueprint/InputComponent";
import {
  EventType,
  ExecutionResult,
} from "constants/AppsmithActionConstants/ActionConstants";
import { ValidationTypes } from "constants/WidgetValidation";
import { createMessage, FIELD_REQUIRED_ERROR } from "constants/messages";
import { DerivedPropertiesMap } from "utils/WidgetFactory";
import * as Sentry from "@sentry/react";
import withMeta, { WithMeta } from "./MetaHOC";
import { GRID_DENSITY_MIGRATION_V1 } from "mockResponses/WidgetConfigResponse";

class InputWidget extends BaseWidget<InputWidgetProps, WidgetState> {
  constructor(props: InputWidgetProps) {
    super(props);
    this.state = {
      text: props.text,
    };
  }
  static getPropertyPaneConfig() {
    return [
      {
        sectionName: "General",
        children: [
          {
            helpText: "Changes the type of data captured in the input",
            propertyName: "inputType",
            label: "Data Type",
            controlType: "DROP_DOWN",
            options: [
              {
                label: "Text",
                value: "TEXT",
              },
              {
                label: "Number",
                value: "NUMBER",
              },
              {
                label: "Password",
                value: "PASSWORD",
              },
              {
                label: "Email",
                value: "EMAIL",
              },
              {
                label: "Currency",
                value: "CURRENCY",
              },
            ],
            isBindProperty: false,
            isTriggerProperty: false,
          },
          {
            propertyName: "allowCurrencyChange",
            label: "Allow currency change",
            helpText: "Search by currency or country",
            controlType: "SWITCH",
            isJSConvertible: false,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
            hidden: (props: InputWidgetProps) => {
              return props.inputType !== InputTypes.CURRENCY;
            },
          },
          {
            helpText: "Changes the type of currency",
            propertyName: "currencyCountryCode",
            label: "Currency",
            enableSearch: true,
            dropdownHeight: "195px",
            controlType: "DROP_DOWN",
            placeholderText: "Search by code or name",
            options: getCurrencyOptions(),
            hidden: (props: InputWidgetProps) => {
              return props.inputType !== InputTypes.CURRENCY;
            },
            isBindProperty: false,
            isTriggerProperty: false,
          },
          {
            helpText: "No. of decimals in currency input",
            propertyName: "decimalsInCurrency",
            label: "Decimals",
            controlType: "DROP_DOWN",
            options: [
              {
                label: "1",
                value: 1,
              },
              {
                label: "2",
                value: 2,
              },
            ],
            hidden: (props: InputWidgetProps) => {
              return props.inputType !== InputTypes.CURRENCY;
            },
            isBindProperty: false,
            isTriggerProperty: false,
          },
          {
            helpText:
              "Sets the default text of the widget. The text is updated if the default text changes",
            propertyName: "defaultText",
            label: "Default Text",
            controlType: "INPUT_TEXT",
            placeholderText: "Enter default text",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            helpText: "Sets a placeholder text for the input",
            propertyName: "placeholderText",
            label: "Placeholder",
            controlType: "INPUT_TEXT",
            placeholderText: "Enter placeholder text",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            helpText:
              "Adds a validation to the input which displays an error on failure",
            propertyName: "regex",
            label: "Regex",
            controlType: "INPUT_TEXT",
            placeholderText: "^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$",
            inputType: "TEXT",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.REGEX },
          },
          {
            helpText:
              "Displays the error message if the regex validation fails",
            propertyName: "errorMessage",
            label: "Error Message",
            controlType: "INPUT_TEXT",
            placeholderText: "Enter error message",
            inputType: "TEXT",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            propertyName: "isRequired",
            label: "Required",
            helpText: "Makes input to the widget mandatory",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            helpText: "Controls the visibility of the widget",
            propertyName: "isVisible",
            label: "Visible",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            helpText: "Disables input to this widget",
            propertyName: "isDisabled",
            label: "Disabled",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            helpText: "Clears the input value after submit",
            propertyName: "resetOnSubmit",
            label: "Reset on submit",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
        ],
      },
      {
        sectionName: "Actions",
        children: [
          {
            helpText: "Triggers an action when the text is changed",
            propertyName: "onTextChanged",
            label: "onTextChanged",
            controlType: "ACTION_SELECTOR",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: true,
          },
          {
            helpText:
              "Triggers an action on submit (when the enter key is pressed)",
            propertyName: "onSubmit",
            label: "onSubmit",
            controlType: "ACTION_SELECTOR",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: true,
          },
        ],
      },
    ];
  }

  static getDerivedPropertiesMap(): DerivedPropertiesMap {
    return {
      isValid: `{{
        function(){
          let parsedRegex = null;
          if (this.regex) {
            /*
            * break up the regexp pattern into 4 parts: given regex, regex prefix , regex pattern, regex flags
            * Example /test/i will be split into ["/test/gi", "/", "test", "gi"]
            */
            const regexParts = this.regex.match(/(\\/?)(.+)\\1([a-z]*)/i);

            if (!regexParts) {
              parsedRegex = new RegExp(this.regex);
            } else {
              /*
              * if we don't have a regex flags (gmisuy), convert provided string into regexp directly
              /*
              if (regexParts[3] && !/^(?!.*?(.).*?\\1)[gmisuy]+$/.test(regexParts[3])) {
                parsedRegex = RegExp(this.regex);
              }
              /*
              * if we have a regex flags, use it to form regexp
              */
              parsedRegex = new RegExp(regexParts[2], regexParts[3]);
            }
          }
          if (this.inputType === "EMAIL") {
            const emailRegex = new RegExp(/^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+$/);
            return emailRegex.test(this.text);
          }
          else if (this.inputType === "NUMBER") {
            if (parsedRegex) {
              return parsedRegex.test(this.text);
            }
            if (this.isRequired) {
              return !(this.text === '' || isNaN(this.text));
            }

            return (this.text === '' || !isNaN(this.text || ''));
          }
          else if (this.isRequired) {
            if(this.text && this.text.length) {
              if (parsedRegex) {
                return parsedRegex.test(this.text)
              } else {
                return true;
              }
            } else {
              return false;
            }
          } if (parsedRegex) {
            return parsedRegex.test(this.text)
          } else {
            return true;
          }
        }()
      }}`,
      value: `{{this.text}}`,
    };
  }

  static getDefaultPropertiesMap(): Record<string, string> {
    return {
      text: "defaultText",
    };
  }

  static getMetaPropertiesMap(): Record<string, any> {
    return {
      text: undefined,
      isFocused: false,
      isDirty: false,
      selectedCurrencyType: undefined,
    };
  }

  onValueChange = (value: string) => {
    this.props.updateWidgetMetaProperty("text", value, {
      triggerPropertyName: "onTextChanged",
      dynamicString: this.props.onTextChanged,
      event: {
        type: EventType.ON_TEXT_CHANGE,
      },
    });
    if (!this.props.isDirty) {
      this.props.updateWidgetMetaProperty("isDirty", true);
    }
  };

  onCurrencyTypeChange = (code?: string) => {
    const currencyCountryCode = code;
    if (this.props.renderMode === RenderModes.CANVAS) {
      super.updateWidgetProperty("currencyCountryCode", currencyCountryCode);
    } else {
      this.props.updateWidgetMetaProperty(
        "selectedCurrencyCountryCode",
        currencyCountryCode,
      );
    }
  };

  handleFocusChange = (focusState: boolean) => {
    this.props.updateWidgetMetaProperty("isFocused", focusState);
  };

  onSubmitSuccess = (result: ExecutionResult) => {
    if (result.success && this.props.resetOnSubmit) {
      this.props.updateWidgetMetaProperty("text", "", {
        triggerPropertyName: "onSubmit",
        dynamicString: this.props.onTextChanged,
        event: {
          type: EventType.ON_TEXT_CHANGE,
        },
      });
    }
  };

  handleKeyDown = (
    e:
      | React.KeyboardEvent<HTMLTextAreaElement>
      | React.KeyboardEvent<HTMLInputElement>,
  ) => {
    const { isValid, onSubmit } = this.props;
    const isEnterKey = e.key === "Enter" || e.keyCode === 13;
    if (isEnterKey && onSubmit && isValid) {
      super.executeAction({
        triggerPropertyName: "onSubmit",
        dynamicString: onSubmit,
        event: {
          type: EventType.ON_SUBMIT,
          callback: this.onSubmitSuccess,
        },
      });
    }
  };

  getPageView() {
    const value = this.props.text || "";
    const isInvalid =
      "isValid" in this.props && !this.props.isValid && !!this.props.isDirty;
    const currencyCountryCode =
      this.props.selectedCurrencyCountryCode ?? this.props.currencyCountryCode;
    const conditionalProps: Partial<InputComponentProps> = {};
    conditionalProps.errorMessage = this.props.errorMessage;
    if (this.props.isRequired && value.length === 0) {
      conditionalProps.errorMessage = createMessage(FIELD_REQUIRED_ERROR);
    }
    if (this.props.maxChars) conditionalProps.maxChars = this.props.maxChars;
    if (this.props.maxNum) conditionalProps.maxNum = this.props.maxNum;
    if (this.props.minNum) conditionalProps.minNum = this.props.minNum;
    return (
      <InputComponent
        allowCurrencyChange={this.props.allowCurrencyChange}
        currencyCountryCode={currencyCountryCode}
        decimalsInCurrency={this.props.decimalsInCurrency}
        defaultValue={this.props.defaultText}
        disableNewLineOnPressEnterKey={!!this.props.onSubmit}
        disabled={this.props.isDisabled}
        inputType={this.props.inputType}
        isInvalid={isInvalid}
        isLoading={this.props.isLoading}
        label={this.props.label}
        multiline={
          // GRID_DENSITY_MIGRATION_V1 used to adjust code as per new scaled canvas.
          (this.props.bottomRow - this.props.topRow) /
            GRID_DENSITY_MIGRATION_V1 >
            1 && this.props.inputType === "TEXT"
        }
        onCurrencyTypeChange={this.onCurrencyTypeChange}
        onFocusChange={this.handleFocusChange}
        onKeyDown={this.handleKeyDown}
        onValueChange={this.onValueChange}
        placeholder={this.props.placeholderText}
        showError={!!this.props.isFocused}
        stepSize={1}
        value={value}
        widgetId={this.props.widgetId}
        {...conditionalProps}
      />
    );
  }

  getWidgetType(): WidgetType {
    return "INPUT_WIDGET";
  }
}

export const InputTypes: { [key: string]: string } = {
  TEXT: "TEXT",
  NUMBER: "NUMBER",
  INTEGER: "INTEGER",
  PHONE_NUMBER: "PHONE_NUMBER",
  EMAIL: "EMAIL",
  PASSWORD: "PASSWORD",
  CURRENCY: "CURRENCY",
  SEARCH: "SEARCH",
};

export type InputType = typeof InputTypes[keyof typeof InputTypes];

export interface InputValidator {
  validationRegex: string;
  errorMessage: string;
}
export interface InputWidgetProps extends WidgetProps, WithMeta {
  inputType: InputType;
  currencyCountryCode?: string;
  noOfDecimals?: number;
  allowCurrencyChange?: boolean;
  decimalsInCurrency?: number;
  defaultText?: string;
  isDisabled?: boolean;
  text: string;
  regex?: string;
  errorMessage?: string;
  placeholderText?: string;
  maxChars?: number;
  minNum?: number;
  maxNum?: number;
  onTextChanged?: string;
  label: string;
  inputValidators: InputValidator[];
  isValid: boolean;
  focusIndex?: number;
  isAutoFocusEnabled?: boolean;
  isRequired?: boolean;
  isFocused?: boolean;
  isDirty?: boolean;
  onSubmit?: string;
}

export default InputWidget;
export const ProfiledInputWidget = Sentry.withProfiler(withMeta(InputWidget));
