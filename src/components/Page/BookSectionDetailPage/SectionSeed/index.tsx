import React, { useEffect, useRef, useState } from "react";
import "./style.scss";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import SectionModel from "../../../../model/SectionModel";
import ThemeModel from "../../../../model/ThemeModel";
import EditControls from "../../../../components/Note/ui/EditControls";
import ViewControls from "../../../../components/Note/ui/ViewControls";
import { cloneDeep } from "lodash";
import { getEditorConfig } from "../../../../utils/EditorUtils";
import { useSelector } from "react-redux";
import {
  AlignmentType,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ThemeType,
} from "basicui";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { updateSection } from "../../BookSectionPage/service";
import HeadEditor from "./HeadEditor";
import HeadViewer from "./HeadViewer";

interface Props {
  space: string;
  section: SectionModel;
  onRefresh: any;
}

const SectionSeed = (props: Props) => {
  const editor = getEditorConfig();
  const navigate = useNavigate();
  const authorization = useSelector((state: any) => state.authorization);
  const [saving, setSaving] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [state, setState] = useState<SectionModel>({
    title: "",
    description: "",
  });
  const [isDeletePromptOpen, setIsDeletePromptOpen] = useState(false);

  useEffect(() => {
    reset();
  }, [props.section]);

  const onEdit = () => {
    setIsEdit(true);
  };

  const onCancelHead = () => {
    reset();
    setIsEdit(false);
  };

  const reset = () => {
    setState(cloneDeep(props.section));
  };

  useEffect(() => {
    editor?.commands.setContent(props.section.description);
  }, [props.section]);

  const onSave = (event: any) => {
    setSaving(true);
    updateSection(
      props.space,
      props.section.bookref || "",
      props.section.reference || "",
      { ...state, description: editor?.getHTML() || "" },
      authorization
    )
      .then((response) => {
        props.onRefresh();
        setIsEdit(false);
        setSaving(false);
      })
      .catch(() => setSaving(false));
  };

  const onChange = (event: any) => {
    setState({ ...state, ...event });
  };

  return (
    <>
      <div className="section-seed">
        {isEdit && (
          <EditControls
            onCancel={onCancelHead}
            onSave={onSave}
            saving={saving}
          />
        )}
        {!isEdit && (
          <ViewControls
            onEdit={onEdit}
            // onRemove={onDelete}
            disable={false}
            // onRemove={() => setIsDeletePromptOpen(true)}
            // onPrint={onPrint}
            // textToSpeak={props.bookSectionDetail.content?.replace(/<[^>]+>/g, "")}
          />
        )}
        {isEdit && (
          <HeadEditor
            space={props.space}
            section={state}
            onChange={onChange}
            editor={editor}
          />
        )}

        {!isEdit && (
          <HeadViewer space={props.space} section={state} />
        )}
      </div>
    </>
  );
};

export default SectionSeed;
