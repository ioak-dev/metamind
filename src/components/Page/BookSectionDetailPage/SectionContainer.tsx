import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./SectionContainer.scss";
import Topbar from "../../../components/Topbar";
import { useParams } from "react-router-dom";
import MainSection from "../../../components/MainSection";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNodes, faFileAlt } from "@fortawesome/free-solid-svg-icons";
import { isEmptyAttributes, isEmptyOrSpaces } from "../../../components/Utils";
import { createBookdetail, updateBookdetail } from "./service";
import EditControls from "../../../components/Note/ui/EditControls";
import ViewControls from "../../../components/Note/ui/ViewControls";
import { cloneDeep } from "lodash";
import HeadEditor from "./HeadEditor";
import { getEditorConfig } from "../../../utils/EditorUtils";
import BookSectionDetailModel from "../../../model/BookSectionDetailModel";
import { getSectionType } from "./SectionTypes";
import SectionModel from "../../../model/SectionModel";
import BookLogModel from "../../../model/BookLogModel";
import { LoadingBlocks } from "basicui";

interface Props {
  space: string;
  bookSectionDetail: BookSectionDetailModel;
  bookSection: SectionModel;
  onRefresh: any;
  log: BookLogModel[];
}

const SectionContainer = (props: Props) => {
  const editor = getEditorConfig();

  const params = useParams();
  const dispatch = useDispatch();
  const authorization = useSelector((state: any) => state.authorization);
  const [saving, setSaving] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [state, setState] = useState<BookSectionDetailModel>({
    content: "",
    type: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const logList = props.log.filter(
      (item) =>
        item.bookref === props.bookSectionDetail.bookref &&
        item.sectionref === props.bookSectionDetail.sectionref &&
        item.sectiontype === props.bookSectionDetail.type &&
        item.isRunning
    );
    console.log(props.log, props.bookSectionDetail);
    setIsGenerating(logList.length > 0);
  }, [props.log, props.bookSectionDetail]);

  useEffect(() => {
    setState({ ...props.bookSectionDetail });
  }, [props.bookSectionDetail]);

  const onEdit = () => {
    setIsEdit(true);
  };

  const onCancelHead = () => {
    reset();
    setIsEdit(false);
  };

  const reset = () => {
    setState(cloneDeep(props.bookSectionDetail));
  };

  useEffect(() => {
    editor?.commands.setContent(props.bookSectionDetail.content);
  }, [props.bookSectionDetail]);

  const onSave = (event: any, reload?: boolean) => {
    setSaving(true);
    updateBookdetail(
      props.space,
      props.bookSectionDetail._id || "",
      { ...state, content: editor?.getHTML() },
      authorization
    )
      .then((response) => {
        props.onRefresh();
        setIsEdit(false);
        setSaving(false);
      })
      .catch(() => setSaving(false));
  };

  // const saveChanges = () => {
  //   saveNote(props.space, state, authorization).then((response: any) => {
  //     if (response) {
  //       setState(response);
  //       setView('view');
  //     }
  //   });
  // };

  const onChange = (event: any) => {
    setState({ ...state, ...event });
  };

  const onGenerate = () => {
    setSaving(true);
    setIsGenerating(true);
    createBookdetail(
      props.space,
      props.bookSectionDetail.bookref || "",
      props.bookSectionDetail.sectionref || "",
      {
        type: props.bookSectionDetail.type,
        sectionTitle: props.bookSectionDetail.customTitle,
        sectionDescription: props.bookSectionDetail.customDescription,
      },
      authorization
    )
      .then((response) => {
        setSaving(false);
        props.onRefresh();
      })
      .catch(() => setSaving(false));
  };

  return (
    <div className="book-section-detail-section-container">
      {isEdit && (
        <EditControls onCancel={onCancelHead} onSave={onSave} saving={saving} />
      )}
      {!isEdit && (
        <ViewControls
          onEdit={onEdit}
          // onRemove={onDelete}
          // disable={isEdit}
          disable={isGenerating}
          onGenerate={onGenerate}
          // onPrint={onPrint}
          // textToSpeak={props.bookSectionDetail.content?.replace(/<[^>]+>/g, "")}
        />
      )}
      {isEdit && (
        <HeadEditor
          space={props.space}
          bookSectionDetail={state}
          onChange={onChange}
          editor={editor}
        />
      )}
      {!isEdit && (
        <div>
          {/* {props.bookSectionDetail.type !== "summary" && ( */}
            <h4>{getSectionType(props.bookSectionDetail.type)?.description}</h4>
          {/* )} */}
          {/* {props.bookSectionDetail.type === "summary" && (
            <h4>{props.bookSection.title}</h4>
          )} */}
          {!isGenerating && (
            <div
              dangerouslySetInnerHTML={{
                __html: props.bookSectionDetail.content || "",
              }}
            />
          )}

          {isGenerating && (
            <LoadingBlocks numberOfBlocks={6} minWidth={20} maxWidth={40} />
          )}
        </div>
      )}
    </div>
  );
};

export default SectionContainer;
