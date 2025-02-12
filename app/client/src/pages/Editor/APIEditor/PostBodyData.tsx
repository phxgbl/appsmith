import React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { formValueSelector } from "redux-form";
import {
  ApiContentTypes,
  POST_BODY_FORMAT_OPTIONS,
  POST_BODY_FORMAT_TITLES,
} from "constants/ApiEditorConstants";
import { API_EDITOR_FORM_NAME } from "constants/forms";
import KeyValueFieldArray from "components/editorComponents/form/fields/KeyValueFieldArray";
import DynamicTextField from "components/editorComponents/form/fields/DynamicTextField";
import { AppState } from "reducers";
import FIELD_VALUES from "constants/FieldExpectedValue";
import {
  EditorModes,
  EditorSize,
  EditorTheme,
  TabBehaviour,
} from "components/editorComponents/CodeEditor/EditorConfig";
import MultiSwitch from "components/ads/MultiSwitch";
import { updateBodyContentType } from "actions/apiPaneActions";

const PostBodyContainer = styled.div`
  padding: 12px 0px 0px;
  background-color: ${(props) => props.theme.colors.apiPane.bg};
  height: 100%;
`;

const JSONEditorFieldWrapper = styled.div`
  margin: 0 30px;
  width: 65%;
  .CodeMirror {
    height: auto;
    min-height: 250px;
  }
`;

interface PostDataProps {
  displayFormat: any;
  dataTreePath: string;
  theme?: EditorTheme;
  updateBodyContentType: (contentType: ApiContentTypes, apiId: string) => void;
  apiId: string;
}

type Props = PostDataProps;

const expectedPostBody = {
  type: FIELD_VALUES.API_ACTION.body,
  example: "",
};

function PostBodyData(props: Props) {
  const {
    apiId,
    dataTreePath,
    displayFormat,
    theme,
    updateBodyContentType,
  } = props;

  return (
    <PostBodyContainer>
      <MultiSwitch
        onSelect={(title: ApiContentTypes) =>
          updateBodyContentType(title, apiId)
        }
        selected={displayFormat}
        tabs={POST_BODY_FORMAT_TITLES.map((el) => {
          let component = (
            <JSONEditorFieldWrapper
              className={"t--apiFormPostBody"}
              key={el.key}
            >
              <DynamicTextField
                dataTreePath={`${dataTreePath}.body`}
                expected={expectedPostBody}
                mode={EditorModes.JSON_WITH_BINDING}
                name="actionConfiguration.body"
                placeholder={
                  '{\n  "name":"{{ inputName.property }}",\n  "preference":"{{ dropdownName.property }}"\n}\n\n\\\\Take widget inputs using {{ }}'
                }
                showLineNumbers
                size={EditorSize.EXTENDED}
                tabBehaviour={TabBehaviour.INDENT}
                theme={theme}
              />
            </JSONEditorFieldWrapper>
          );
          if (
            el.title === ApiContentTypes.FORM_URLENCODED ||
            el.title === ApiContentTypes.MULTIPART_FORM_DATA
          ) {
            component = (
              <KeyValueFieldArray
                dataTreePath={`${dataTreePath}.bodyFormData`}
                key={el.key}
                label=""
                name="actionConfiguration.bodyFormData"
                theme={theme}
              />
            );
          } else if (el.title === ApiContentTypes.RAW) {
            component = (
              <JSONEditorFieldWrapper key={el.key}>
                <DynamicTextField
                  dataTreePath={`${dataTreePath}.body`}
                  mode={EditorModes.TEXT_WITH_BINDING}
                  name="actionConfiguration.body"
                  size={EditorSize.EXTENDED}
                  tabBehaviour={TabBehaviour.INDENT}
                  theme={theme}
                />
              </JSONEditorFieldWrapper>
            );
          }
          return { key: el.key, title: el.title, panelComponent: component };
        })}
      />
    </PostBodyContainer>
  );
}

const selector = formValueSelector(API_EDITOR_FORM_NAME);

const mapDispatchToProps = (dispatch: any) => ({
  updateBodyContentType: (contentType: ApiContentTypes, apiId: string) =>
    dispatch(updateBodyContentType(contentType, apiId)),
});

export default connect((state: AppState) => {
  const apiId = selector(state, "id");
  const extraFormData = state.ui.apiPane.extraformData[apiId] || {};
  const displayFormat =
    extraFormData["displayFormat"] || POST_BODY_FORMAT_OPTIONS[3];

  return {
    displayFormat,
    apiId,
  };
}, mapDispatchToProps)(PostBodyData);
